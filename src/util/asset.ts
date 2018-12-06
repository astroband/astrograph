import stellar from "stellar-base";
import { Asset } from "stellar-sdk";

export default class extends Asset {
  public static build(type: number, code: string, issuer: string): Asset {
    return type === stellar.xdr.AssetType.assetTypeNative().value ? Asset.native() : new Asset(code, issuer);
  }
}
