import { IDatabase } from "pg-promise";
import squel from "squel";
import { PagingParams } from "../datasource/horizon/base";
import { Asset, AssetID, Balance, IAssetInput } from "../model";
import { AssetFactory, BalanceFactory, IAssetTableRow } from "../model/factories";
import { parseCursorPagination, properlyOrdered, SortOrder } from "../util/paging";

const TABLE_NAME = "assets";

export default class AssetsRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  public async findByID(assetId: AssetID) {
    const queryBuilder = squel
      .select()
      .from(TABLE_NAME)
      .where("assetid = ?", assetId);

    const res = await this.db.oneOrNone(queryBuilder.toString());

    return res ? AssetFactory.fromDb(res) : null;
  }

  public async findAllByIDs(assetIds: AssetID[]) {
    if (assetIds.length === 0) {
      return [];
    }

    const queryBuilder = squel
      .select()
      .from(TABLE_NAME)
      .where("assetid IN ?", assetIds);

    const res = await this.db.manyOrNone<IAssetTableRow>(queryBuilder.toString());
    const assets = res.map<Asset>(r => AssetFactory.fromDb(r));

    return assetIds.map(id => assets.find(a => a.id === id) || null);
  }

  public async findAll(criteria: IAssetInput, paging: PagingParams) {
    const { limit, cursor, order } = parseCursorPagination(paging);
    // We skip lumens here for the sake of consistent pagination
    // they have `native` as an id and pagination token so it will
    // break intended alphanumeric ordering
    // Anyway, it seems a rare case, when someone would need lumens in
    // the aggregate list
    const queryBuilder = squel
      .select()
      .from(TABLE_NAME)
      .where("assetid != ?", Asset.NATIVE_ID)
      .order("assetid", order === SortOrder.ASC)
      .limit(limit);

    if (criteria.code) {
      queryBuilder.where("code = ?", criteria.code);
    }

    if (criteria.issuer) {
      queryBuilder.where("issuer = ?", criteria.issuer);
    }

    if (cursor) {
      if (paging.after) {
        queryBuilder.where("assetid > ?", paging.after);
      } else if (paging.before) {
        queryBuilder.where("assetid < ?", paging.before);
      }
    }

    const res = await this.db.manyOrNone(queryBuilder.toString());
    const assets = res.map(r => AssetFactory.fromDb(r));

    return properlyOrdered(assets, paging);
  }

  public async findHolders(asset: IAssetInput, paging: PagingParams) {
    const { limit, cursor, order } = parseCursorPagination(paging);
    const queryBuilder = squel
      .select()
      .from("trustlines")
      .where("assetcode = ?", asset.code)
      .where("issuer = ?", asset.issuer)
      .order("balance", order === SortOrder.ASC) // we must order by balance first to support cursor pagination
      .order("accountid", order !== SortOrder.ASC) // inversion of above
      .limit(limit);

    if (cursor) {
      const [accountId, , balance] = Balance.parsePagingToken(cursor);

      if (paging.after) {
        queryBuilder.where("(balance = ? AND accountid > ?) OR balance < ?", balance, accountId, balance);
      } else if (paging.before) {
        queryBuilder.where("(balance = ? AND accountid < ?) OR balance > ?", balance, accountId, balance);
      }
    }

    const res = await this.db.manyOrNone(queryBuilder.toString());
    const balances = res.map(r => BalanceFactory.fromDb(r));

    return properlyOrdered(balances, paging);
  }
}
