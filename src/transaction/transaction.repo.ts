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

  public findByLedgerSeq(ledgerSeq: number): Promise<Transaction[]> {
    return this.db.any("SELECT * FROM txhistory WHERE ledgerseq = $1 ORDER BY txindex", ledgerSeq);
    // res.map(t => new Transaction(t))
    // );
  }
}
