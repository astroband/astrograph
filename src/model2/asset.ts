import stellar from "stellar-base";
import { Asset as AssetBase } from "stellar-sdk";
import { IAssetInput } from "./asset_input";

export class Asset extends AssetBase {
  public static fromDb(type: number, code: string, issuer: string): Asset {
    return type === stellar.xdr.AssetType.assetTypeNative().value ? Asset.native() : new Asset(code, issuer);
  }

  public static fromAssetInput(arg: IAssetInput): Asset | null {
    if (!arg) {
      return null;
    }

    if (arg.issuer && arg.code) {
      return new Asset(arg.code, arg.issuer);
    }

    return Asset.native();
  }
}
