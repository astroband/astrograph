import stellar from "stellar-base";
import {
  AccountSubscriptionPayload,
  DataEntrySubscriptionPayload,
  MutationType,
  TrustLineSubscriptionPayload
} from "../model";

export type Payload = AccountSubscriptionPayload | TrustLineSubscriptionPayload | DataEntrySubscriptionPayload;

// Collection of ledger changes loaded from transaction metas, contains data only from ledger.
export class Collection extends Array<Payload> {
  // Concats parsed stellar.xdr.DataEntryChange[] to array
  public concatXDR(xdr: any) {
    for (const change of xdr) {
      this.pushXDR(change);
    }
  }

  // Pushes parsed stellar.xdr.DataEntryChange to current array
  public pushXDR(xdr: any) {
    const t = stellar.xdr.LedgerEntryChangeType;

    switch (xdr.switch()) {
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
        this.pushAccountEventPayload(mutationType, xdr.account());
        break;
      case t.trustline():
        this.pushTrustLineEventPayload(mutationType, xdr.trustLine());
        break;
      case t.datum():
        this.pushDataEntryPayload(mutationType, xdr.data());
        break;
    }
  }

  private pushAccountEventPayload(mutationType: MutationType, xdr: any) {
    this.push(new AccountSubscriptionPayload(mutationType, xdr));
  }

  private pushTrustLineEventPayload(mutationType: MutationType, xdr: any) {
    this.push(new TrustLineSubscriptionPayload(mutationType, xdr));
  }

  private pushDataEntryPayload(mutationType: MutationType, xdr: any) {
    this.push(new DataEntrySubscriptionPayload(mutationType, xdr));
  }
}
