import stellar from "stellar-base";

// Type, IType etc, short as possible, will be fixed by export.
enum ChangeType {
  Create = "CREATE",
  Update = "UPDATE",
  Remove = "REMOVE"
}

export interface IType {
  type: ChangeType;
}

export interface IAccountID {
  accountID: string;
}

export interface IAsset {
  type: number;
  code: string;
  issuer: string;
}

export type AccountChange = IType & IAccountID;
export type TrustLineChange = AccountChange & IAsset;
export type Change = AccountChange | TrustLineChange;

// Collection of ledger changes loaded from transaction metas, contains data only from ledger.
export class LedgerChangesArray extends Array<Change> {
  public concatXDR(xdr: any) {
    for (const change of xdr) {
      this.pushXDR(change);
    }
  }

  public pushXDR(xdr: any) {
    const t = stellar.xdr.LedgerEntryChangeType;

    switch (xdr.switch()) {
      case t.ledgerEntryCreated():
        this.fetchCreate(xdr.created().data());
        break;

      case t.ledgerEntryUpdated():
        this.fetchUpdate(xdr.updated().data());
        break;

      case t.ledgerEntryRemoved():
        this.fetchRemove(xdr.removed());
        break;
    }
  }

  private fetchCreate(xdr: any) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEvent(ChangeType.Create, xdr);
        break;
    }
  }

  private fetchUpdate(xdr: any) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEvent(ChangeType.Update, xdr);
        break;
    }
  }

  private fetchRemove(xdr: any) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEvent(ChangeType.Remove, xdr);
        break;
    }
  }

  private stringifyAccountID(value: Buffer): string {
    return stellar.StrKey.encodeEd25519PublicKey(value);
  }

  private pushAccountEvent(type: ChangeType, xdr: any) {
    const accountID = this.stringifyAccountID(xdr.account().accountId().value());
    this.push({ type, accountID });
  }
}
