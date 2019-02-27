import _ from "lodash";
import { IDatabase } from "pg-promise";
import squel from "squel";
import { Account } from "../model";
import { AccountFactory, IAccountTableRow } from "../model/factories";

const sql = {
  selectAccount: "SELECT * FROM accounts WHERE accountid = $1",
  selectAccountsIn: "SELECT * FROM accounts WHERE accountid IN ($1:csv) ORDER BY accountid DESC",
  selectSignedAccountIds:
    "SELECT * FROM accounts WHERE accountid IN (SELECT accountid FROM signers WHERE publickey = $1 ORDER BY accountid LIMIT $2)"
};

export default class AccountsRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a transaction by id;
  public findByID(id: string): Promise<Account | null> {
    return this.db.oneOrNone(
      sql.selectAccount,
      id,
      (res: IAccountTableRow) => (res ? AccountFactory.fromDb(res) : null)
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

  public async findAllBySigner(id: string, limit: number): Promise<Account[]> {
    const res = await this.db.manyOrNone(sql.selectSignedAccountIds, [id, limit]);
    return res.map((v: IAccountTableRow) => AccountFactory.fromDb(v));
  }

  public async count() {
    const queryBuilder = squel
      .select()
      .field("count(*)")
      .from("accounts");

    return this.db.one(queryBuilder.toString(), [], c => +c.count);
  }
}
