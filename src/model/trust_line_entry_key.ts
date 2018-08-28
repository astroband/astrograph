import { Asset } from "./asset";
import { EntryType, IEntryType } from "./entry_type";

import { assetFromXDR, publicKeyFromXDR } from "../common/xdr";

export class TrustLineEntryKey implements IEntryType {
  public static buildFromXDR(entryType: EntryType, xdr: any): TrustLineEntryKey {
    const { assettype, assetcode, issuer } = assetFromXDR(xdr);
    const asset = new Asset(assettype, assetcode, issuer);

    return new TrustLineEntryKey(entryType, asset, publicKeyFromXDR(xdr));
  }

  public accountID: string;
  public asset: Asset;
  public entryType: EntryType;

  constructor(entryType: EntryType, asset: Asset, id: string) {
    this.accountID = id;
    this.entryType = entryType;
    this.asset = asset;
  }
}
