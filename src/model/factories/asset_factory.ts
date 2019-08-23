import stellar from "stellar-base";
import { AccountID, Asset, AssetCode, AssetID } from "../";

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

  public static fromTrustline(type: number, code: string, issuer: string): stellar.Asset {
    return type === stellar.xdr.AssetType.assetTypeNative().value
      ? stellar.Asset.native()
      : new stellar.Asset(code, issuer);
  }

  public static fromId(id: string) {
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
