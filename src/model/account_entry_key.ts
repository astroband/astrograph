import { EntryType, IEntryType } from "./entry_type";

import { publicKeyFromXDR } from "../common/xdr";

export class AccountEntryKey implements IEntryType {
  public static buildFromXDR(entryType: EntryType, xdr: any): AccountEntryKey {
    return new AccountEntryKey(entryType, publicKeyFromXDR(xdr));
  }

  public accountID: string;
  public entryType: EntryType;

  constructor(entryType: EntryType, id: string) {
    this.accountID = id;
    this.entryType = entryType;
  }
}
