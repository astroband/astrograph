import { IDatabase } from "pg-promise";
import Account from "./account.model";

export default class AccountsRepository {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a transaction by id;
  public findByID(id: string): Promise<Account> {
    return this.db.oneOrNone("SELECT * FROM accounts WHERE accountid = $1", id, res => new Account(res));
  }
}
