import { UserInputError } from "apollo-server";
import { IDatabase } from "pg-promise";
import squel from "squel";
import stellar from "stellar-base";
import { IAssetInput, Offer } from "../model";

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

    if (selling) {
      if (selling.issuer && selling.code) {
        queryBuilder.where("sellingissuer = ?", selling.issuer);
        queryBuilder.where("sellingassetcode = ?", selling.code);
      } else {
        if (selling.code.toUpperCase() !== "XLM") {
          throw new UserInputError("Set issuer or use code XLM");
        }
        queryBuilder.where("sellingassettype = ?", stellar.xdr.AssetType.assetTypeNative().value);
      }
    }

    if (limit) {
      queryBuilder.limit(limit);
    }

    if (offset) {
      queryBuilder.offset(offset);
    }

    const res = await this.db.manyOrNone(queryBuilder.toString());

    return res.map(a => new Offer(a));
  }
}
