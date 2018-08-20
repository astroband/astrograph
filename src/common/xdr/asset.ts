import stellar from "stellar-base";

import { publicKeyFromBuffer } from "./account_id";

export function assetFromXDR(xdr: any): any {
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

  return { assettype, assetcode, issuer };
}
