import { IDatabase } from "pg-promise";
import { joinToMap, unique } from "../common/util/array";
import { Account } from "../model";

const sql = {
  selectAccount: "SELECT * FROM accounts WHERE accountid = $1",
  selectAccountsIn: "SELECT * FROM accounts WHERE accountid IN ($1:csv) ORDER BY accountid",
  selectSignedAccountIds: "SELECT accountid FROM signers WHERE publickey = $1 ORDER BY accountid LIMIT $2"
};

export default class AccountsRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a transaction by id;
  public findByID(id: string): Promise<Account | null> {
    return this.db.oneOrNone(sql.selectAccount, id, res => (res ? new Account(res) : null));
  }

  public async findAllByIDs(ids: string[]): Promise<Array<Account | null>> {
    if (ids.length === 0) {
      return new Array<Account | null>();
    }

    const res = await this.db.manyOrNone(sql.selectAccountsIn, [ids.filter(unique)]);
    const accounts = res.map(v => new Account(v));

    return ids.map<Account | null>(id => accounts.find(a => a.id === id) || null);
  }

  public async findAllMapByIDs(ids: string[]): Promise<Map<string, Account>> {
    const res = await this.findAllByIDs(ids);
    return joinToMap<string, Account>(ids, res);
  }

  public async findAllBySigner(id: string, limit: number): Promise<Array<Account | null>> {
    const accountIds = await this.db.manyOrNone(sql.selectSignedAccountIds, [id, limit]);
    const accounts = this.findAllByIDs(accountIds.map((r: any) => r.accountid));
    return accounts;
  }
}
