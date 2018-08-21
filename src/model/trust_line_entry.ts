import { EntryType, IEntryType } from "./entry_type";
import { TrustLine } from "./trust_line";

import { assetFromXDR, publicKeyFromXDR } from "../common/xdr";

export class TrustLineEntry extends TrustLine implements IEntryType {
  public static buildFromXDR(entryType: EntryType, xdr: any): TrustLineEntry {
    const { assettype, assetcode, issuer } = assetFromXDR(xdr);

    return new TrustLineEntry(entryType, {
      accountid: publicKeyFromXDR(xdr),
      balance: xdr.balance().toString(),
      tlimit: xdr.limit().toString(),
      flags: xdr.flags(),
      assettype,
      assetcode,
      issuer
    });
  }

  public entryType: EntryType;

  constructor(entryType: EntryType, data: any) {
    super(data);
    this.entryType = entryType;
  }
}
