import stellar from "stellar-base";
import { diffAccountsXDR, publicKeyFromXDR } from "../common/xdr";
import {
  AccountSubscriptionPayload,
  DataEntrySubscriptionPayload,
  MutationType,
  NativeTrustLineSubscriptionPayload,
  TrustLineSubscriptionPayload
} from "../model";

export type Payload =
  | AccountSubscriptionPayload
  | TrustLineSubscriptionPayload
  | NativeTrustLineSubscriptionPayload
  | DataEntrySubscriptionPayload;

const changeType = stellar.xdr.LedgerEntryChangeType;
const ledgerEntryType = stellar.xdr.LedgerEntryType;

// Collection of ledger changes loaded from transaction metas, contains data only from ledger.
export class Collection extends Array<Payload> {
  public concatXDR(xdrArray: any) {
    xdrArray.forEach((xdr: any, i: number) => {
      if (
        xdr.switch() !== changeType.ledgerEntryUpdated() ||
        xdr
          .updated()
          .data()
          .switch() !== ledgerEntryType.account()
      ) {
        this.pushXDR(xdr);
        return;
      }

      const data = xdr.updated().data();
      const account = data.account();
      // TODO: it's memory inefficient, I guess, need to fix in the future
      const prevChanges = xdrArray.slice(0, i);
      const accountChanges = this.accountChanges(account, prevChanges);

      if (accountChanges.includes("balance")) {
        this.pushNativeBalanceChangePayload(account);
      }

      // if there are some changes besides balance
      if (accountChanges.some(c => c !== "balance")) {
        this.pushXDR(xdr);
      }
    });
  }

  // Pushes parsed stellar.xdr.DataEntryChange to current array
  private pushXDR(xdr: any) {
    switch (xdr.switch()) {
      case changeType.ledgerEntryCreated():
        this.fetch(xdr.created().data(), MutationType.Create);
        break;

      case changeType.ledgerEntryUpdated():
        this.fetch(xdr.updated().data(), MutationType.Update);
        break;

      case changeType.ledgerEntryRemoved():
        this.fetch(xdr.removed(), MutationType.Remove);
        break;
    }
  }

  private fetch(xdr: any, mutationType: MutationType) {
    switch (xdr.switch()) {
      case ledgerEntryType.account():
        this.pushAccountPayload(mutationType, xdr.account());
        break;
      case ledgerEntryType.trustline():
        this.pushTrustLinePayload(mutationType, xdr.trustLine());
        break;
      case ledgerEntryType.datum():
        this.pushDataEntryPayload(mutationType, xdr.data());
        break;
    }
  }

  private pushAccountPayload(mutationType: MutationType, xdr: any) {
    this.push(new AccountSubscriptionPayload(mutationType, xdr));
  }

  private pushTrustLinePayload(mutationType: MutationType, xdr: any) {
    this.push(new TrustLineSubscriptionPayload(mutationType, xdr));
  }

  private pushDataEntryPayload(mutationType: MutationType, xdr: any) {
    this.push(new DataEntrySubscriptionPayload(mutationType, xdr));
  }

  private accountChanges(account: any, xdrArray: any[]): string[] {
    const updateAccount = this.findUpdateOrState(xdrArray, publicKeyFromXDR(account));

    if (!updateAccount) {
      return [];
    }

    return diffAccountsXDR(account, updateAccount);
  }

  private pushNativeBalanceChangePayload(account: any) {
    const payload = new NativeTrustLineSubscriptionPayload(MutationType.Update, account);

    this.push(payload);
  }

  private findUpdateOrState(xdrArray: any[], accountId: string): any {
    return xdrArray
      .reverse()
      .reduce((accumulator: any[], x: any) => {
        let data: any;

        switch (x.switch()) {
          case changeType.ledgerEntryUpdated():
            data = x.updated().data();
            break;
          case changeType.ledgerEntryState():
            data = x.state().data();
            break;
        }

        if (data && data.switch() === ledgerEntryType.account()) {
          accumulator.push(data.account());
        }

        return accumulator;
      }, [])
      .find((account: any) => publicKeyFromXDR(account) === accountId);
  }
}
