import stellar from "stellar-base";

export enum LedgerEventType {
  Create,
  Update,
  Remove
}

export default class LedgerEvent {
  // Takes LedgerEntryChange xdr and builds the new Change
  public static build(xdr: any): LedgerEvent | null {
    const r = LedgerEvent.getTypeAndData(xdr);
    if (r === null) {
      return null;
    }

    const accountID = LedgerEvent.getAccountID(r.data);
    if (accountID === null) {
      return null;
    }

    return new LedgerEvent(stellar.StrKey.encodeEd25519PublicKey(accountID), r.type);
  }

  private static getTypeAndData(xdr: any): any | null {
    const t = stellar.xdr.LedgerEntryChangeType;

    switch (xdr.switch()) {
      case t.ledgerEntryCreated():
        return {
          type: LedgerEventType.Create,
          data: xdr.created().data()
        };
        break;

      case t.ledgerEntryUpdated():
        return {
          type: LedgerEventType.Update,
          data: xdr.updated().data()
        };
        break;

      case t.ledgerEntryRemoved():
        return {
          type: LedgerEventType.Remove,
          data: xdr.removed()
        };
        break;
    }

    return null;
  }

  private static getAccountID(xdr: any): string | null {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        return xdr
          .account()
          .accountId()
          .value();
        break;

      case t.trustline():
        return xdr
          .trustLine()
          .accountId()
          .value();
        break;

      case t.data():
        return xdr
          .data()
          .accountId()
          .value();
        break;

      case t.offer():
        return xdr
          .offer()
          .sellerId()
          .value();
        break;
    }

    return null;
  }

  public subject: string;
  public type: LedgerEventType;

  constructor(subject: string, type: LedgerEventType) {
    this.subject = subject;
    this.type = type;
  }
}
