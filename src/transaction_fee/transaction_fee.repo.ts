import { IDatabase } from "pg-promise";
import TransactionFee from "./transaction_fee.model";

export default class TransactionFeesRepository {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Fetches all transactions by ledger seq;
  public async findAllBySeq(seq: number): Promise<TransactionFee[]> {
    const res = await this.db.manyOrNone("SELECT * FROM txfeehistory WHERE ledgerseq = $1 ORDER BY txindex", seq);
    return res.map(t => new TransactionFee(t));
  }
}
