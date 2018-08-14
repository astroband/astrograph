import stellar from "stellar-base";

const at = stellar.xdr.AssetType;

export enum AssetType {
  Native = at.assetTypeNative().value,
  AlphaNum4 = at.assetTypeCreditAlphanum4().value,
  AlphaNum12 = at.assetTypeCreditAlphanum12().value
}
