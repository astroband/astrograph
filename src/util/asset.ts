import stellar from "stellar-base";
import { Asset } from "stellar-sdk";

export function buildAsset(type: number, code: string, issuer: string): Asset {
  return type === stellar.xdr.AssetType.assetTypeNative().value ? Asset.native() : new Asset(code, issuer);
}
