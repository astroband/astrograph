import { IDatabase } from "pg-promise";
import Transaction from "./transaction.model";

export default class TransactionsRepository {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a transaction by id;
  public findByID(id: string): Promise<Transaction> {
    return this.db.oneOrNone("SELECT * FROM txhistory WHERE txid = $1", id, res => new Transaction(res));
  }

  // Fetches all transactions by ledger seq;
  public async findAllBySeq(seq: number): Promise<Transaction[]> {
    const res = await this.db.manyOrNone("SELECT * FROM txhistory WHERE ledgerseq = $1 ORDER BY txindex", seq);
    return res.map(t => new Transaction(t));
  }
}
