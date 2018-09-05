import stellar from "stellar-base";
import {
  AccountEventPayload,
  AccountEventRemovePayload,
  DataEntrySubscriptionPayload,
  MutationType,
  TrustLineEventPayload,
  TrustLineEventRemovePayload
} from "../model";

export type Payload =
  | AccountEventPayload
  | AccountEventRemovePayload
  | TrustLineEventPayload
  | TrustLineEventRemovePayload
  | DataEntrySubscriptionPayload;

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
        this.fetchCreateUpdate(xdr.created().data(), MutationType.Create);
        break;

      case t.ledgerEntryUpdated():
        this.fetchCreateUpdate(xdr.updated().data(), MutationType.Update);
        break;

      case t.ledgerEntryRemoved():
        this.fetchRemove(xdr.removed());
        break;
    }
  }

  private fetchCreateUpdate(xdr: any, mutationType: MutationType) {
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

  private fetchRemove(xdr: any) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEventRemovePayload(xdr.account());
        break;
      case t.trustline():
        this.pushTrustLineEventRemovePayload(xdr.trustLine());
        break;
      case t.datum():
        this.pushDataEntryRemovePayload(xdr.data());
        break;
    }
  }

  private pushAccountEventPayload(mutationType: MutationType, xdr: any) {
    this.push(AccountEventPayload.buildFromXDR(mutationType, xdr));
  }

  private pushAccountEventRemovePayload(xdr: any) {
    this.push(AccountEventRemovePayload.buildFromXDR(MutationType.Remove, xdr));
  }

  private pushTrustLineEventPayload(mutationType: MutationType, xdr: any) {
    this.push(TrustLineEventPayload.buildFromXDR(mutationType, xdr));
  }

  private pushTrustLineEventRemovePayload(xdr: any) {
    this.push(TrustLineEventRemovePayload.buildFromXDR(MutationType.Remove, xdr));
  }

  private pushDataEntryPayload(mutationType: MutationType, xdr: any) {
    this.push(new DataEntrySubscriptionPayload(mutationType, xdr));
  }

  private pushDataEntryRemovePayload(xdr: any) {
    this.push(new DataEntrySubscriptionPayload(MutationType.Remove, xdr));
  }
}
