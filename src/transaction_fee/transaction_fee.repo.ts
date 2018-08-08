import { IDatabase } from "pg-promise";
import Transaction from "./transaction_fee.model";

export default class TransactionFeesRepository {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a transaction by id;
  public findByID(id: string): Promise<TransactionFee> {
    return this.db.oneOrNone("SELECT * FROM txhistory WHERE txid = $1", id, res => new TransactionFee(res));
  }
}
