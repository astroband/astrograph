import { IDatabase } from "pg-promise";
import squel from "squel";
import { Asset } from "stellar-sdk";
import { PagingParams } from "../datasource/horizon/base";
import { BalanceFactory } from "../model/factories";
import { parseCursorPagination, properlyOrdered, SortOrder } from "../util/paging";

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

  public async findHolders(asset: Asset, paging: PagingParams) {
    const queryBuilder = squel
      .select()
      .from("trustlines")
      .where("assetcode = ?", asset.getCode())
      .where("issuer = ?", asset.getIssuer());

    const { limit, cursor, order } = parseCursorPagination(paging);

    queryBuilder.limit(limit);

    // Order of these stetements is important,
    // we must order by balance first to support cursor pagination
    queryBuilder.order("balance", order === SortOrder.ASC);
    queryBuilder.order("accountid");

    if (cursor) {
      const [, , balance] = Buffer.from(cursor, "base64")
        .toString()
        .split("_");

      if (paging.after) {
        queryBuilder.where("balance < ?", balance);
      } else {
        queryBuilder.where("balance > ?", balance);
      }
    }

    const res = await this.db.manyOrNone(queryBuilder.toString());
    const balances = res.map(r => BalanceFactory.fromDb(r));

    return properlyOrdered(balances, paging);
  }
}
