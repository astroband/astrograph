import { EntryType, IEntryType } from "./entry_type";
import { TrustLine } from "./trust_line";

import stellar from "stellar-base";

import { publicKeyFromXDR, publicKeyFromBuffer } from "../common/xdr";

export class TrustLineEntry extends TrustLine implements IEntryType {
  public static buildFromXDR(entryType: EntryType, xdr: any): TrustLineEntry {
    const t = stellar.xdr.AssetType;
    const asset = xdr.asset();
    const xdrSwitch = asset.switch();
    const assettype = xdrSwitch.value;

    let assetcode = "";
    let issuer = "";

    const branch =
      xdrSwitch === t.assetTypeNative()
        ? null
        : xdrSwitch === t.assetTypeCreditAlphanum4()
          ? asset.alphaNum4()
          : asset.alphaNum12();

    if (branch !== null) {
      assetcode = branch.assetCode().toString("utf8");
      issuer = publicKeyFromBuffer(branch.issuer().value());
    }

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
