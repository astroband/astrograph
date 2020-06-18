import { IDatabase } from "pg-promise";
import { TransactionWithXDR } from "../model";
import { TransactionWithXDRFactory } from "../model/factories";

const sql = {
  selectTx:
    "SELECT t.*, f.txchanges as txfeemeta FROM txhistory t LEFT JOIN txfeehistory f ON t.txid = f.txid WHERE t.txid = $1",
  selectTxIn:
    "SELECT t.*, f.txchanges as txfeemeta FROM txhistory t LEFT JOIN txfeehistory f ON t.txid = f.txid WHERE t.txid IN ($1:csv) ORDER BY t.ledgerseq, t.txindex",
  selectTxNoFee: "SELECT * FROM txhistory WHERE ledgerseq = $1 ORDER BY txindex",
  selectFee: "SELECT txindex, txchanges FROM txfeehistory WHERE ledgerseq = $1 AND txindex IN ($2:list)"
};

export default class TransactionsRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Fetches all transactions by ledger seq;
  public async findAllBySeq(seq: number): Promise<TransactionWithXDR[]> {
    const txs = await this.db.manyOrNone(sql.selectTxNoFee, seq);

    if (txs.length === 0) {
      return [];
    }

    const feeMetas: Array<{ txindex: string; txchanges: string }> = await this.db.many(sql.selectFee, [
      seq,
      txs.map(tx => tx.txindex)
    ]);

    return txs
      .map(tx => {
        const meta = feeMetas.find(m => m.txindex === tx.txindex);
        return meta ? { ...tx, txfeemeta: meta.txchanges } : null;
      })
      .filter(tx => tx !== null)
      .map(tx => TransactionWithXDRFactory.fromDb(tx));
  }
}
