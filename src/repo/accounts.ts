import { compact } from "../common/util/array";

import { IDatabase } from "pg-promise";
import { Account } from "../model";

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
    const map = new Map<string, Account>();

    if (ids.length === 0) {
      return map;
    }

    const res = await this.findAllByIDs(ids);
    const resNonNull = res.filter(compact) as Account[];

    if (resNonNull.length === 0) {
      return map;
    }

    for (const a of resNonNull) {
      map.set(a.id, a);
    }

    return map;
  }
}
