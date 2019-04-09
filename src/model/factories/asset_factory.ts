import { Asset, xdr as XDR } from "stellar-base";
import { HorizonAssetType } from "../../datasource/types";
import { IAssetInput } from "../asset_input";

export class AssetFactory {
  public static fromDb(type: number, code: string, issuer: string) {
    return type === XDR.AssetType.assetTypeNative().value ? Asset.native() : new Asset(code, issuer);
  }

  public static fromHorizon(type: HorizonAssetType, code?: string, issuer?: string) {
    return type === "native" ? Asset.native() : new Asset(code, issuer);
  }

  public static fromInput(arg: IAssetInput) {
    if (arg.issuer && arg.code) {
      return new Asset(arg.code, arg.issuer);
    }

    return Asset.native();
  }

  public static fromId(id: string) {
    if (id === "native") {
      return Asset.native();
    }

    const [code, issuer] = id.split("-");

    if (!issuer) {
      throw new Error(`Invalid asset id "${id}"`);
    }

    return new Asset(code, issuer);
  }

  public static fromXDR(xdr: any, encoding = "base64") {
    return Asset.fromOperation(XDR.Asset.fromXDR(xdr, encoding));
  }
}
