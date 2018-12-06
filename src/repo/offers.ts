import { IDatabase } from "pg-promise";
import squel from "squel";
import { Offer } from "../model";
import Asset from "../util/asset";

export default class OffersRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAll(seller?: string, selling?: Asset, buying?: Asset, limit?: number, offset?: number) {
    const queryBuilder = squel
      .select()
      .field("*")
      .from("offers")
      .order("offerid");

    if (seller) {
      queryBuilder.where("sellerid = ?", seller);
    }

    if (selling) {
      if (selling.code) {
        queryBuilder.where("sellingassetcode = ?", selling.code);
      }

      if (selling.issuer) {
        queryBuilder.where("sellingissuer = ?", selling.issuer);
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
