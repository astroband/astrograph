import stellar from "stellar-base";
import {
  AccountSubscriptionPayload,
  DataEntrySubscriptionPayload,
  MutationType,
  TrustLine,
  TrustLineSubscriptionPayload
} from "../model";

export type Payload = AccountSubscriptionPayload | TrustLineSubscriptionPayload | DataEntrySubscriptionPayload;

// Collection of ledger changes loaded from transaction metas, contains data only from ledger.
export class Collection extends Array<Payload> {
  public ingest(xdrArray: any) {
    const t = stellar.xdr.LedgerEntryChangeType;

    xdrArray.forEach((xdr: any, i: number) => {
      if (xdr.switch() !== t.ledgerEntryState()) {
        this.pushXDR(xdr);
        return;
      }

      const update = xdrArray[i + 1];

      if (!update || update.switch() !== t.ledgerEntryUpdated()) {
        this.pushXDR(xdr);
        return;
      }

      const oldBalance = xdr
        .state()
        .data()
        .account()
        .balance()
        .toString();
      const newBalance = update
        .updated()
        .data()
        .account()
        .balance()
        .toString();

      if (oldBalance !== newBalance) {
        const payload = new TrustLineSubscriptionPayload(
          MutationType.Update,
          TrustLine.buildFakeNativeDataFromXDR(
            update
              .updated()
              .data()
              .account()
          )
        );
        this.push(payload);
      }
    });
  }

  // Pushes parsed stellar.xdr.DataEntryChange to current array
  public pushXDR(xdr: any) {
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
}
