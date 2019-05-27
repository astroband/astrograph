import { xdr as XDR } from "stellar-base";
import { Asset as StellarAsset } from "stellar-sdk";
import { AccountID, Asset, AssetCode, AssetID, IAssetInput } from "../";
import { HorizonAssetType } from "../../datasource/types";

export interface IAssetTableRow {
  assetid: AssetID;
  code: AssetCode;
  issuer: AccountID;
  total_supply: string;
  circulating_supply: string;
  holders_count: string;
  unauthorized_holders_count: string;
  flags: number;
  last_activity: number;
}

export class AssetFactory {
  public static fromDb(row: IAssetTableRow): Asset {
    return new Asset({
      code: row.code,
      issuer: row.issuer,
      totalSupply: row.total_supply,
      circulatingSupply: row.circulating_supply,
      holdersCount: row.holders_count,
      unauthorizedHoldersCount: row.unauthorized_holders_count,
      lastModifiedIn: row.last_activity,
      flags: row.flags
    });
  }

  public static fromTrustline(type: number, code: string, issuer: string): StellarAsset {
    return type === XDR.AssetType.assetTypeNative().value ? StellarAsset.native() : new StellarAsset(code, issuer);
  }

  public static fromHorizon(type: HorizonAssetType, code?: string, issuer?: string) {
    return type === "native" ? StellarAsset.native() : new StellarAsset(code!, issuer!);
  }

  public static fromInput(arg: IAssetInput) {
    if (arg.issuer && arg.code) {
      return new StellarAsset(arg.code, arg.issuer);
    }

    return StellarAsset.native();
  }

  public static fromId(id: string) {
    if (id === "native") {
      return StellarAsset.native();
    }

    const [code, issuer] = id.split("-");

    if (!issuer) {
      throw new Error(`Invalid asset id "${id}"`);
    }

    return new StellarAsset(code, issuer);
  }

  public static fromXDR(xdr: any, encoding = "base64") {
    return StellarAsset.fromOperation(XDR.Asset.fromXDR(xdr, encoding));
  }
}
