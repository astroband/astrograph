import { UserInputError } from "apollo-server";
import { IDatabase } from "pg-promise";
import squel from "squel";
import stellar from "stellar-base";
import { IAssetInput } from "../model";
import { OfferFactory } from "../model/factories";

export default class OffersRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAll(
    criteria?: {
      seller?: string;
      selling?: IAssetInput;
      buying?: IAssetInput;
    },
    limit?: number,
    offset?: number,
    order?: [string, "ASC" | "DESC"]
  ) {
    const queryBuilder = squel
      .select()
      .field("*")
      .from("offers");

    if (!order) {
      order = ["offerid", "DESC"];
    }

    queryBuilder.order(order[0], order[1] === "ASC");

    if (criteria) {
      if (criteria.seller) {
        queryBuilder.where("sellerid = ?", criteria.seller);
      }

      this.appendAsset(queryBuilder, "selling", criteria.selling);
      this.appendAsset(queryBuilder, "buying", criteria.buying);
    }

    if (limit) {
      queryBuilder.limit(limit);
    }

    if (offset) {
      queryBuilder.offset(offset);
    }

    const res = await this.db.manyOrNone(queryBuilder.toString());

    return res.map(a => OfferFactory.fromDb(a));
  }

  public async count() {
    const queryBuilder = squel
      .select()
      .field("count(*)")
      .from("offers");

    return this.db.one(queryBuilder.toString(), [], c => +c.count);
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
