import _ from "lodash";
import { IDatabase } from "pg-promise";
import { TransactionWithXDR } from "../model";
import { ITransactionTableRow, TransactionWithXDRFactory } from "../model/factories";

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

  // Tries to find a transaction by id;
  public findByID(id: string): Promise<TransactionWithXDR | null> {
    return this.db.oneOrNone(
      sql.selectTx,
      id,
      (res: ITransactionTableRow) => (res ? TransactionWithXDRFactory.fromDb(res) : null)
    );
  }

  // TODO: Must be DRYed
  public async findAllByID(ids: string[]): Promise<Array<TransactionWithXDR | null>> {
    if (ids.length === 0) {
      return new Array<TransactionWithXDR | null>();
    }

    const res = await this.db.manyOrNone(sql.selectTxIn, [_.uniq(ids)]);
    const txs = res.map((v: ITransactionTableRow) => TransactionWithXDRFactory.fromDb(v));

    return ids.map<TransactionWithXDR | null>(id => txs.find(a => a.id === id) || null);
  }

  // Fetches all transactions by ledger seq;
  public async findAllBySeq(seq: number): Promise<TransactionWithXDR[]> {
    const txs = await this.db.manyOrNone(sql.selectTxNoFee, seq);

    if (txs.length === 0) {
      return [];
    }

    const feeMetas = await this.db.many(sql.selectFee, [seq, _.map(txs, "txindex")]);

    return _
      .chain(txs)
      .map(tx => {
        const meta = _.find(feeMetas, { txindex: tx.txindex }) as { txchanges: string };
        if (!meta) {
          return;
        }
        return {
          ...tx,
          txfeemeta: meta.txchanges
        };
      })
      .filter()
      .map(t => TransactionWithXDRFactory.fromDb(t))
      .value();
  }
}
