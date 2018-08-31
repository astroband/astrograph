import { IDatabase } from "pg-promise";
import { unique } from "../common/util/array";
import { Transaction } from "../model";

const sql = {
  selectTx: "SELECT * FROM txhistory WHERE txid = $1",
  selectTxIn: "SELECT * FROM txhistory WHERE txid IN ($1:csv) ORDER BY ledgerseq, txindex",
  selectTxInSeq: "SELECT * FROM txhistory WHERE ledgerseq = $1 ORDER BY txindex"
};

export default class TransactionsRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a transaction by id;
  public findByID(id: string): Promise<Transaction> {
    return this.db.oneOrNone(sql.selectTx, id, res => new Transaction(res));
  }

  // TODO: Must be DRYed
  public async findAllByID(ids: string[]): Promise<Array<Transaction | null>> {
    if (ids.length === 0) {
      return new Array<Transaction | null>();
    }

    const res = await this.db.manyOrNone(sql.selectTxIn, [ids.filter(unique)]);
    const txs = res.map(v => new Transaction(v));

    return ids.map<Transaction | null>(id => txs.find(a => a.id === id) || null);
  }

  // Fetches all transactions by ledger seq;
  public async findAllBySeq(seq: number): Promise<Transaction[]> {
    const res = await this.db.manyOrNone(sql.selectTxInSeq, seq);
    return res.map(t => new Transaction(t));
  }
}
