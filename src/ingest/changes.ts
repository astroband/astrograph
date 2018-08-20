import stellar from "stellar-base";
// , , IEntryType
import { AccountEntry, AccountEntryKey, EntryType, TrustLineEntry } from "../model";
// import { kindOf, unique } from "../common/util/array";
//
// export interface IAsset {
//   assetType: number;
//   code: string;
//   issuer: string;
// }
//
// class AccountEntry extends Account implements IType {
//   public type: Type;
//
//   constructor(type: Type, data: any) {
//     super(data)
//     this.type = type;
//   }
// }
//
// class AccountKey implements IType {
//   public type: Type;
//   public id: string;
//
//   constructor(type: Type, id: string) {
//     this.type = type;
//     this.id = id;
//   }
// }
//
// export type AccountChange = IType & IAccountID & { kind: "Account" };
// export type TrustLineChange = IType & IAccountID & IAsset & { kind: "TrustLine" };
export type Entry = AccountEntry | AccountEntryKey | TrustLineEntry;

// Collection of ledger changes loaded from transaction metas, contains data only from ledger.
export class Collection extends Array<Entry> {
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
        this.fetchCreateUpdate(xdr.created().data(), EntryType.Create);
        break;

      case t.ledgerEntryUpdated():
        this.fetchCreateUpdate(xdr.updated().data(), EntryType.Update);
        break;

      case t.ledgerEntryRemoved():
        this.fetchRemove(xdr.removed());
        break;
    }
  }

  // Returns unique array of account ids involved
  public accountIDs(): string[] {
    return [];
    // return this.filter(kindOf("Account"))
    //   .filter(unique)
    //   .map(v => v.accountID);
  }

  // Returns unique array of trustline params
  public trustLineAccountIDs(): string[] {
    return [];
    // return this.filter(kindOf("TrustLine"))
    //   .filter(unique)
    //   .map(v => v.accountID);
  }

  private fetchCreateUpdate(xdr: any, entryType: EntryType) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEntry(entryType, xdr.account());
        break;
      case t.trustline():
        this.pushTrustLineEntry(entryType, xdr.trustLine());
        break;
    }
  }

  private fetchRemove(xdr: any) {
    const t = stellar.xdr.LedgerEntryType;

    switch (xdr.switch()) {
      case t.account():
        this.pushAccountEntryKey(xdr.account());
        break;
      case t.trustline():
        // this.pushTrustLineEvent(type, xdr.trustLine());
        break;
    }
  }

  private pushAccountEntry(entryType: EntryType, xdr: any) {
    this.push(AccountEntry.buildFromXDR(entryType, xdr));
  }

  private pushAccountEntryKey(xdr: any) {
    this.push(AccountEntryKey.buildFromXDR(EntryType.Remove, xdr));
  }

  private pushTrustLineEntry(entryType: EntryType, xdr: any) {
    this.push(TrustLineEntry.buildFromXDR(entryType, xdr));
  }

  // private pushTrustLineEvent(type: Type, xdr: any) {
  //   const kind = "TrustLine";
  //
  //   const accountID = this.stringifyAccountIDFromXDR(xdr);
  //   const { assetType, code, issuer } = this.assetFromXDR(xdr);
  //
  //   this.push({ type, accountID, kind, assetType, code, issuer });
  // }
}
