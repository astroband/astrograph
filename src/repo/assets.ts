import { IDatabase } from "pg-promise";
import squel from "squel";
import { Asset } from "stellar-base";

export default class AssetsRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findAll(code?: string, issuer?: string, limit?: number, offset?: number) {
    const queryBuilder = squel
      .select()
      .field("assetcode")
      .field("issuer")
      .from("trustlines")
      .group("assetcode")
      .group("issuer")
      .order("assetcode");

    if (code) {
      queryBuilder.having("assetcode = ?", code);
    }

    if (issuer) {
      queryBuilder.having("issuer = ?", issuer);
    }

    if (limit) {
      queryBuilder.limit(limit);
    }

    if (offset) {
      queryBuilder.offset(offset);
    }

    const res = await this.db.manyOrNone(queryBuilder.toString());

    return res.map(a => new Asset(a.assetcode, a.issuer));
  }
}
