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

// Collection of ledger changes loaded from transaction metas, contains data only from ledger.
export class Collection extends Array<Payload> {
  public concatXDR(xdrArray: any) {
    const t = stellar.xdr.LedgerEntryChangeType;

    xdrArray.forEach((xdr: any, i: number) => {
      if (xdr.switch() !== t.ledgerEntryUpdated()) {
        this.pushXDR(xdr);
        return;
      }

      try {
        const account = xdr
          .updated()
          .data()
          .account();

        const prevChanges = xdrArray.slice(0, i);

        if (this.nativeBalanceChanged(account, prevChanges)) {
          this.pushNativeBalanceChangePayload(account);
        } else {
          this.pushXDR(xdr);
        }
      } catch(e) {
        console.log(e);
        console.log(xdr);
        console.log(xdr.toXDR("base64"));
      }
    });
  }

  // Pushes parsed stellar.xdr.DataEntryChange to current array
  private pushXDR(xdr: any) {
    const t = stellar.xdr.LedgerEntryChangeType;

    switch (xdr.switch()) {
      case t.ledgerEntryState():
        this.fetch(xdr.state().data(), MutationType.State);
        break;

      case t.ledgerEntryCreated():
        this.fetch(xdr.created().data(), MutationType.Create);
        break;

      case t.ledgerEntryUpdated():
        this.fetch(xdr.updated().data(), MutationType.Update);
        break;

      case t.ledgerEntryRemoved():
        this.fetch(xdr.removed(), MutationType.Remove);
        break;
    }
  }

  private fetch(xdr: any, mutationType: MutationType) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountPayload(mutationType, xdr.account());
        break;
      case t.trustline():
        this.pushTrustLinePayload(mutationType, xdr.trustLine());
        break;
      case t.datum():
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
    const t = stellar.xdr.LedgerEntryChangeType;

    return xdrArray
      .reverse()
      .reduce((accumulator: any[], x: any) => {
        switch (x.switch()) {
          case t.ledgerEntryUpdated():
            accumulator.push(x.updated().data().account());
            break;
          case t.ledgerEntryState():
            accumulator.push(x.state().data().account());
            break;
        }

        return accumulator;
      }, [])
      .find((account: any) => { return publicKeyFromXDR(account) === accountId });
  }
}
