import stellar from "stellar-base";
import { ofType, unique } from "../common/util/array";

export enum Type {
  Create = "CREATE",
  Update = "UPDATE",
  Remove = "REMOVE"
}

export interface IType {
  type: Type;
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
export class Collection extends Array<Change> {
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
        this.fetchCreateUpdate(xdr.created().data(), Type.Create);
        break;

      case t.ledgerEntryUpdated():
        this.fetchCreateUpdate(xdr.updated().data(), Type.Update);
        break;

      case t.ledgerEntryRemoved():
        this.fetchRemove(xdr.removed());
        break;
    }
  }

  // Returns unique array of account ids involved
  public accountIDs(): string[] {
    return this.filter(ofType<IAccountID>())
      .map(c => (c as IAccountID).accountID)
      .filter(unique);
  }

  private fetchCreateUpdate(xdr: any, type: Type) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEvent(type, xdr);
        break;
    }
  }

  private fetchRemove(xdr: any) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEvent(Type.Remove, xdr);
        break;
    }
  }

  private stringifyAccountID(value: Buffer): string {
    return stellar.StrKey.encodeEd25519PublicKey(value);
  }

  private pushAccountEvent(type: Type, xdr: any) {
    const accountID = this.stringifyAccountID(
      xdr
        .account()
        .accountId()
        .value()
    );
    this.push({ type, accountID });
  }
}

// Returns trustline complex keys involved
// public trustLineKeys() {
//
// }
//
// public dataEntryKeys() {
//
// }
