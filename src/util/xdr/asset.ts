import stellar from "stellar-base";

import { publicKeyFromBuffer } from "./account";

export function assetFromXDR(asset: any): any {
  const t = stellar.xdr.AssetType;
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
