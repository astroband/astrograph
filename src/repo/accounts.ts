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
}
