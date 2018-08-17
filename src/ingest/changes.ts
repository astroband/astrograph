import stellar from "stellar-base";
import { kindOf, unique } from "../common/util/array";

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
  assetType: number;
  code: string;
  issuer: string;
}

export type AccountChange = IType & IAccountID & { kind: "Account" };
export type TrustLineChange = IType & IAccountID & IAsset & { kind: "TrustLine" };
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
    return this.filter(kindOf("Account"))
      .filter(unique)
      .map(v => v.accountID);
  }

  // Returns unique array of trustline params
  public trustLineChanges(): string[] {
    return this.filter(kindOf("TrustLine"))
      .filter(unique)
      .map(v => v.accountID);
  }

  private fetchCreateUpdate(xdr: any, type: Type) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEvent(type, xdr.account());
        break;
      case t.trustline():
        this.pushTrustLineEvent(type, xdr.trustLine());
        break;
    }
  }

  private fetchRemove(xdr: any) {
    const t = stellar.xdr.LedgerEntryType;
    const type = Type.Remove;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEvent(type, xdr.account());
        break;
      case t.trustline():
        this.pushTrustLineEvent(type, xdr.trustLine());
        break;
    }
  }

  private stringifyPublicKey(value: Buffer): string {
    return stellar.StrKey.encodeEd25519PublicKey(value);
  }

  private pushAccountEvent(type: Type, xdr: any) {
    const kind = "Account";
    const accountID = this.stringifyAccountIDFromXDR(xdr);
    this.push({ type, accountID, kind });
  }

  private pushTrustLineEvent(type: Type, xdr: any) {
    const kind = "TrustLine";

    const accountID = this.stringifyAccountIDFromXDR(xdr);
    const { assetType, code, issuer } = this.assetFromXDR(xdr);

    this.push({ type, accountID, kind, assetType, code, issuer });
  }

  private stringifyAccountIDFromXDR(xdr: any): string {
    return this.stringifyPublicKey(xdr.accountId().value());
  }

  private assetFromXDR(xdr: any): IAsset {
    const t = stellar.xdr.AssetType;

    let code: string = "";
    let issuer: string = "";

    const asset = xdr.asset();
    const assetType = asset.switch().value;

    if (assetType !== t.assetTypeNative()) {
      const method = assetType === t.assetTypeCreditAlphanum4() ? "alphaNum4" : "alphaNum12";
      const data = asset[method]();
      code = data.assetCode().toString("utf8");
      issuer = this.stringifyPublicKey(data.issuer().value());
    }

    return { assetType, code, issuer };
  }
}
// public dataEntryKeys() {
//
// }
