import { Asset, xdr } from "stellar-base";
import { AssetID } from "../";

export class AssetFactory {
  public static fromTrustline(type: number, code: string, issuer: string): Asset {
    return type === xdr.AssetType.assetTypeNative().value ? Asset.native() : new Asset(code, issuer);
  }

  public static fromId(id: AssetID) {
    if (id === "native") {
      return Asset.native();
    }

    const [code, issuer] = id.split("-");

    if (!issuer) {
      throw new Error(`Invalid asset id "${id}"`);
    }

    return new Asset(code, issuer);
  }

  public static fromXDR(input: any) {
    return Asset.fromOperation(xdr.Asset.fromXDR(input, "base64"));
  }
}
