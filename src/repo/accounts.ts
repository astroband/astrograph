import { IDatabase } from "pg-promise";
import { joinToMap } from "../common/util/array";
import { Account } from "../model";

const sql = {
  selectAccount: "SELECT * FROM accounts WHERE accountid = $1",
  selectAccountsIn: "SELECT * FROM accounts WHERE accountid IN ($1:csv) ORDER BY accountid"
};

export default class AccountsRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a transaction by id;
  public findByID(id: string): Promise<Account> {
    return this.db.oneOrNone(sql.selectAccount, id, res => new Account(res));
  }

  public async findAllByIDs(ids: string[]): Promise<Array<Account | null>> {
    if (ids.length === 0) {
      return new Array<Account | null>();
    }

    const res = await this.db.manyOrNone(sql.selectAccountsIn, [ids]);
    const accounts = res.map(v => new Account(v));

    return ids.map<Account | null>(id => accounts.find(a => a.id === id) || null);
  }

  public async findAllMapByIDs(ids: string[]): Promise<Map<string, Account>> {
    const res = await this.findAllByIDs(ids);
    return joinToMap<string, Account>(ids, res);
  }
}
