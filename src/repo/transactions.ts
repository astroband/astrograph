import _ from "lodash";
import { IDatabase } from "pg-promise";
import { Transaction } from "../model";
import { unique } from "../util/array";

const sql = {
  selectTx:
    "SELECT t.*, f.txchanges as txfeemeta FROM txhistory t LEFT JOIN txfeehistory f ON t.txid = f.txid WHERE t.txid = $1",
  selectTxIn:
    "SELECT t.*, f.txchanges as txfeemeta FROM txhistory t LEFT JOIN txfeehistory f ON t.txid = f.txid WHERE t.txid IN ($1:csv) ORDER BY t.ledgerseq, t.txindex"
};

export default class TransactionsRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a transaction by id;
  public findByID(id: string): Promise<Transaction | null> {
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
    const txSelect = "SELECT * FROM txhistory WHERE ledgerseq = $1 ORDER BY txindex";
    const txs = await this.db.manyOrNone(txSelect, seq);

    if (txs.length === 0) {
      return [];
    }

    const feeMetaSelect = "SELECT txid, txchanges FROM txfeehistory WHERE ledgerseq = $1 AND txindex IN ($2:list)";
    const feeMetas = await this.db.many(feeMetaSelect, [seq, _.map(txs, "txindex")]);

    return _
      .chain(txs)
      .map(tx => {
        const meta = _.find(feeMetas, { txindex: tx.txindex }) as { txchanges: string };
        if (!meta) {
          return;
        }
        return {...tx, txfeemeta: meta.txchanges};
      })
      .filter()
      .map(t => new Transaction(t))
      .value();
  }
}
