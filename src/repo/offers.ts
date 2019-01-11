import { UserInputError } from "apollo-server";
import { IDatabase } from "pg-promise";
import squel from "squel";
import stellar from "stellar-base";
import { IAssetInput } from "../model"; //, Offer
import { OfferFactory } from "../model/factories";

export default class OffersRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAll(seller?: string, selling?: IAssetInput, buying?: IAssetInput, limit?: number, offset?: number) {
    const queryBuilder = squel
      .select()
      .field("*")
      .from("offers")
      .order("offerid");

    if (seller) {
      queryBuilder.where("sellerid = ?", seller);
    }

    this.appendAsset(queryBuilder, "selling", selling);
    this.appendAsset(queryBuilder, "buying", buying);

    if (limit) {
      queryBuilder.limit(limit);
    }

    if (offset) {
      queryBuilder.offset(offset);
    }

    const res = await this.db.manyOrNone(queryBuilder.toString());

    return res.map(a => OfferFactory.fromDb(a));
  }

  private appendAsset(queryBuilder: any, prefix: string, asset?: IAssetInput) {
    if (asset) {
      if (asset.issuer && asset.code) {
        queryBuilder.where(`${prefix}issuer = ?`, asset.issuer);
        queryBuilder.where(`${prefix}assetcode = ?`, asset.code);
      } else {
        if (asset.code.toUpperCase() !== "XLM") {
          throw new UserInputError("Set issuer or use code XLM");
        }
        queryBuilder.where(`${prefix}assettype = ?`, stellar.xdr.AssetType.assetTypeNative().value);
      }
    }
  }
}
