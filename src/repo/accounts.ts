import _ from "lodash";
import { IDatabase } from "pg-promise";
import squel from "squel";
import { PagingParams } from "../datasource/horizon/base";
import { Account, AccountID } from "../model";
import { AccountFactory, IAccountTableRow } from "../model/factories";
import { parseCursorPagination, properlyOrdered, SortOrder } from "../util/paging";

const sql = {
  selectAccount: "SELECT * FROM accounts WHERE accountid = $1",
  selectAccountsIn: "SELECT * FROM accounts WHERE accountid IN ($1:csv) ORDER BY accountid DESC",
  selectSignedAccountIds:
    "SELECT * FROM accounts WHERE accountid IN (SELECT accountid FROM signers WHERE publickey = $1 ORDER BY accountid LIMIT $2)"
};

interface IFindAllCriteria {
  ids?: AccountID[];
  homeDomain?: string;
}

export default class AccountsRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find an account by id;
  public findByID(id: string): Promise<Account | null> {
    return this.db.oneOrNone(sql.selectAccount, id, (res: IAccountTableRow) =>
      res ? AccountFactory.fromDb(res) : null
    );
  }

  public async findAllByIDs(ids: string[]): Promise<Array<Account | null>> {
    if (ids.length === 0) {
      return new Array<Account | null>();
    }

    const res = await this.db.manyOrNone(sql.selectAccountsIn, [_.uniq(ids)]);
    const accounts = res.map((v: IAccountTableRow) => AccountFactory.fromDb(v));

    return ids.map<Account | null>(id => accounts.find(a => a.id === id) || null);
  }

  public async findAll(criteria: IFindAllCriteria, paging: PagingParams) {
    const { limit, order } = parseCursorPagination(paging);

    const queryBuilder = squel
      .select()
      .from("accounts")
      .order("accountid", order === SortOrder.ASC)
      .limit(limit);

    if (criteria.ids) {
      queryBuilder.where("accountid IN ?", criteria.ids);
    }

    if (criteria.homeDomain) {
      queryBuilder.where("homedomain = ?", Buffer.from(criteria.homeDomain).toString("base64"));
    }

    if (paging.after) {
      queryBuilder.where("accountid > ?", paging.after);
    } else if (paging.before) {
      queryBuilder.where("accountid < ?", paging.before);
    }

    const res = await this.db.manyOrNone(queryBuilder.toString());
    const accounts = res.map(r => AccountFactory.fromDb(r));

    return properlyOrdered(accounts, paging);
  }

  public async findAllBySigner(id: string, limit: number): Promise<Account[]> {
    const res = await this.db.manyOrNone(sql.selectSignedAccountIds, [id, limit]);
    return res.map((v: IAccountTableRow) => AccountFactory.fromDb(v));
  }
}
