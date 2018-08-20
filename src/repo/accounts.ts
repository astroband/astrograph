import { IDatabase } from "pg-promise";
import { Account } from "../model";
import { joinToMap } from "../common/util/array";

export default class AccountsRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a transaction by id;
  public findByID(id: string): Promise<Account> {
    return this.db.oneOrNone("SELECT * FROM accounts WHERE accountid = $1", id, res => new Account(res));
  }

  public async findAllByIDs(ids: string[]): Promise<Array<Account | null>> {
    if (ids.length == 0) {
      return new Array<Account | null>();
    }

    const res = await this.db.manyOrNone("SELECT * FROM accounts WHERE accountid IN ($1:csv) ORDER BY accountid", [
      ids
    ]);

    const rearrange = (id: string) => {
      const a = res.find(r => r.accountid === id);
      if (a) {
        return new Account(a);
      }
      return null;
    };

    return ids.map(rearrange);
  }

  public async findAllMapByIDs(ids: string[]): Promise<Map<string, Account>> {
    const res = await this.findAllByIDs(ids);
    return joinToMap<string, Account>(ids, res);
  }
}
