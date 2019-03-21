import { IDatabase } from "pg-promise";
import squel from "squel";
import { Asset } from "stellar-sdk";
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

  public async getIdAssetsMap() {
    const queryBuilder = squel
      .select()
      .field("offerid")
      .field("sellingasset")
      .field("buyingasset")
      .from("offers");

    const rows = await this.db.manyOrNone(queryBuilder.toString());

    const res: Map<string, { selling: Asset; buying: Asset }> = new Map();

    rows.forEach(row => {
      res.set(row.offerid, {
        selling: AssetFactory.fromXDR(row.sellingasset),
        buying: AssetFactory.fromXDR(row.buyingasset)
      });
    });

    return res;
  }

  public async count() {
    const queryBuilder = squel
      .select()
      .field("count(*)")
      .from("offers");

    return this.db.one(queryBuilder.toString(), [], c => +c.count);
  }

  public async getBestBid(selling: Asset, buying: Asset) {
    const queryBuilder = squel
      .select()
      .field("MIN(price)", "minPrice")
      .from("offers");

    this.appendAsset(queryBuilder, "selling", selling.toString());
    this.appendAsset(queryBuilder, "buying", buying.toString());

    return this.db.one(queryBuilder.toString(), [], r => r.minPrice);
  }

  public async getBestAsk(selling: Asset, buying: Asset) {
    const queryBuilder = squel
      .select()
      .field("MAX(price)", "maxPrice")
      .from("offers");

    this.appendAsset(queryBuilder, "buying", selling.toString());
    this.appendAsset(queryBuilder, "selling", buying.toString());

    return this.db.one(queryBuilder.toString(), [], r => r.maxPrice);
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
