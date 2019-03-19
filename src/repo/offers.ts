import { IDatabase } from "pg-promise";
import squel from "squel";
import { AssetFactory, OfferFactory } from "../model/factories";

export default class OffersRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAll(
    criteria?: {
      seller?: string;
      selling?: string;
      buying?: string;
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

  private appendAsset(queryBuilder: any, prefix: string, assetId?: string) {
    if (!assetId) {
      return;
    }

    const asset = AssetFactory.fromId(assetId);
    queryBuilder.where(
      `${prefix}asset = ?`,
      asset
        .toXDRObject()
        .toXDR()
        .toString("base64")
    );
  }
}
