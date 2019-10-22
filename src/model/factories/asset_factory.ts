import stellar from "stellar-base";
import { AssetID } from "../";

export class AssetFactory {
  public static fromTrustline(type: number, code: string, issuer: string): stellar.Asset {
    return type === stellar.xdr.AssetType.assetTypeNative().value
      ? stellar.Asset.native()
      : new stellar.Asset(code, issuer);
  }

  public static fromId(id: AssetID) {
    if (id === "native") {
      return stellar.Asset.native();
    }

    const [code, issuer] = id.split("-");

    if (!issuer) {
      throw new Error(`Invalid asset id "${id}"`);
    }

    return new stellar.Asset(code, issuer);
  }

  public static fromXDR(xdr: any, encoding = "base64") {
    return stellar.Asset.fromOperation(stellar.xdr.Asset.fromXDR(xdr, encoding));
  }
}
