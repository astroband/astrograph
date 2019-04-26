import { IDatabase } from "pg-promise";
import squel from "squel";
import { Asset, AssetID, Balance, IAssetInput } from "../model";
import { AssetFactory, BalanceFactory, IAssetTableRow } from "../model/factories";
import { PagingParams, parseCursorPagination, properlyOrdered, SortOrder } from "../util/paging";

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
    const ascending = order === SortOrder.ASC;

    const queryBuilder = squel
      .select()
      .from("trustlines")
      .where("assetcode = ?", asset.code)
      .where("issuer = ?", asset.issuer)
      .order("balance", ascending)
      .order("accountid", ascending)
      .limit(limit);

    if (cursor) {
      const [accountId, , balance] = Balance.parsePagingToken(cursor);

      if (ascending) {
        queryBuilder.where("(balance, accountid) > (?, ?)", balance, accountId);
      } else {
        queryBuilder.where("(balance, accountid) < (?, ?)", balance, accountId);
      }
    }

    const res = await this.db.manyOrNone(queryBuilder.toString());
    const balances = res.map(r => BalanceFactory.fromDb(r));

    return properlyOrdered(balances, paging);
  }
}
