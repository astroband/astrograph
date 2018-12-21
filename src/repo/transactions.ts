import _ from "lodash";
import { IDatabase } from "pg-promise";
import { Transaction, TransactionWithXDR } from "../model2";
import { ITransactionTableRow, TransactionFactory, TransactionWithXDRFactory } from "../model2/factories";

const sql = {
  selectTx:
    "SELECT t.*, f.txchanges as txfeemeta FROM txhistory t LEFT JOIN txfeehistory f ON t.txid = f.txid WHERE t.txid = $1",
  selectTxIn:
    "SELECT t.*, f.txchanges as txfeemeta FROM txhistory t LEFT JOIN txfeehistory f ON t.txid = f.txid WHERE t.txid IN ($1:csv) ORDER BY t.ledgerseq, t.txindex",
  selectTxInSeq:
    "SELECT t.*, f.txchanges as txfeemeta FROM txhistory t LEFT JOIN txfeehistory f ON t.txid = f.txid WHERE t.ledgerseq = $1 ORDER BY t.txindex"
};

export default class TransactionsRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a transaction by id;
  public findByID(id: string): Promise<Transaction | null> {
    return this.db.oneOrNone(sql.selectTx, id, (res: ITransactionTableRow) => res ? TransactionFactory.fromDb(res) : null);
  }

  // TODO: Must be DRYed
  public async findAllByID(ids: string[]): Promise<Array<Transaction | null>> {
    if (ids.length === 0) {
      return new Array<Transaction | null>();
    }

    const res = await this.db.manyOrNone(sql.selectTxIn, [_.uniq(ids)]);
    const txs = res.map((v: ITransactionTableRow) => TransactionFactory.fromDb(v));

    return ids.map<Transaction | null>(id => txs.find(a => a.id === id) || null);
  }

  // Fetches all transactions by ledger seq;
  public async findAllBySeq(seq: number): Promise<TransactionWithXDR[]> {
    const res = await this.db.manyOrNone(sql.selectTxInSeq, seq);
    return res.map(t => TransactionWithXDRFactory.fromDb(t));
  }
}
