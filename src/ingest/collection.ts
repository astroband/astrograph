import stellar from "stellar-base";
import {
  AccountSubscriptionPayload,
  DataEntrySubscriptionPayload,
  MutationType,
  TrustLine,
  TrustLineSubscriptionPayload
} from "../model";

import { publicKeyFromXDR } from "../common/xdr";

export type Payload = AccountSubscriptionPayload | TrustLineSubscriptionPayload | DataEntrySubscriptionPayload;

const changeType = stellar.xdr.LedgerEntryChangeType;
const ledgerEntryType = stellar.xdr.LedgerEntryType;

// Collection of ledger changes loaded from transaction metas, contains data only from ledger.
export class Collection extends Array<Payload> {
  public concatXDR(xdrArray: any) {
    xdrArray.forEach((xdr: any, i: number) => {
      if (xdr.switch() !== changeType.ledgerEntryUpdated()) {
        this.pushXDR(xdr);
        return;
      }

      const data = xdr.updated().data();

      if (data.switch() !== ledgerEntryType.account()) {
        this.pushXDR(xdr);
        return;
      }

      const account = data.account();
      const prevChanges = xdrArray.slice(0, i);

      if (this.nativeBalanceChanged(account, prevChanges)) {
        this.pushNativeBalanceChangePayload(account);
      } else {
        this.pushXDR(xdr);
      }
    });
  }

  // Pushes parsed stellar.xdr.DataEntryChange to current array
  private pushXDR(xdr: any) {
    switch (xdr.switch()) {
      case changeType.ledgerEntryState():
        this.fetch(xdr.state().data(), MutationType.State);
        break;

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
    this.push(TrustLineSubscriptionPayload.buildFromXDR(mutationType, xdr));
  }

  private pushDataEntryPayload(mutationType: MutationType, xdr: any) {
    this.push(new DataEntrySubscriptionPayload(mutationType, xdr));
  }

  private nativeBalanceChanged(account: any, xdrArray: any[]): boolean {
    const updateAccount = this.findUpdateOrState(xdrArray, publicKeyFromXDR(account));

    if (!updateAccount) {
      return false;
    }

    const oldBalance = account.balance().toString();
    const newBalance = updateAccount.balance().toString();

    return oldBalance !== newBalance;
  }

  private pushNativeBalanceChangePayload(account: any) {
    const payload = new TrustLineSubscriptionPayload(
      MutationType.Update,
      TrustLine.buildFakeNativeDataFromXDR(account)
    );

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
      .find((account: any) => { return publicKeyFromXDR(account) === accountId });
  }
}
