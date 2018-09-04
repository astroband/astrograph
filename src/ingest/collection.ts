import stellar from "stellar-base";
import {
  AccountEventPayload,
  AccountEventRemovePayload,
  DataEntryEventPayload,
  DataEntryEventRemovePayload,
  PayloadType,
  TrustLineEventPayload,
  TrustLineEventRemovePayload
} from "../model";

export type Payload =
  | AccountEventPayload
  | AccountEventRemovePayload
  | TrustLineEventPayload
  | TrustLineEventRemovePayload;

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
        this.fetchCreateUpdate(xdr.created().data(), PayloadType.Create);
        break;

      case t.ledgerEntryUpdated():
        this.fetchCreateUpdate(xdr.updated().data(), PayloadType.Update);
        break;

      case t.ledgerEntryRemoved():
        this.fetchRemove(xdr.removed());
        break;
    }
  }

  private fetchCreateUpdate(xdr: any, payloadType: PayloadType) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEventPayload(payloadType, xdr.account());
        break;
      case t.trustline():
        this.pushTrustLineEventPayload(payloadType, xdr.trustLine());
        break;
      case t.datum():
        this.pushDataEntryEventPayload(payloadType, xdr.data());
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
        this.pushDataEntryEventRemovePayload(xdr.data());
        break;
    }
  }

  private pushAccountEventPayload(payloadType: PayloadType, xdr: any) {
    this.push(AccountEventPayload.buildFromXDR(payloadType, xdr));
  }

  private pushAccountEventRemovePayload(xdr: any) {
    this.push(AccountEventRemovePayload.buildFromXDR(PayloadType.Remove, xdr));
  }

  private pushTrustLineEventPayload(payloadType: PayloadType, xdr: any) {
    this.push(TrustLineEventPayload.buildFromXDR(payloadType, xdr));
  }

  private pushTrustLineEventRemovePayload(xdr: any) {
    this.push(TrustLineEventRemovePayload.buildFromXDR(PayloadType.Remove, xdr));
  }

  private pushDataEntryEventPayload(payloadType: PayloadType, xdr: any) {
    this.push(DataEntryEventPayload.buildFromXDR(payloadType, xdr));
  }

  private pushDataEntryEventRemovePayload(xdr: any) {
    this.push(DataEntryEventRemovePayload.buildFromXDR(PayloadType.Remove, xdr));
  }
}
