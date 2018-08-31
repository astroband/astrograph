import { IDatabase } from "pg-promise";
import { unique } from "../common/util/array";
import { Ledger } from "../model";

const sql = {
  selectLedger: "SELECT * FROM ledgerheaders WHERE ledgerseq = $1",
  selectLedgersIn: "SELECT * FROM ledgerheaders WHERE ledgerseq IN ($1:csv) ORDER BY ledgerseq",
  selectMaxLedger: "SELECT ledgerseq FROM ledgerheaders ORDER BY ledgerseq DESC LIMIT 1"
};

export default class LedgersRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a ledger from id;
  public findBySeq(seq: number): Promise<Ledger | null> {
    return this.db.oneOrNone(sql.selectLedger, seq, res => (res === null ? null : new Ledger(res)));
  }

  public async findAllBySeq(seqs: number[]): Promise<Array<Ledger | null>> {
    if (seqs.length === 0) {
      return new Array<Ledger | null>();
    }

    const res = await this.db.manyOrNone(sql.selectLedgersIn, [seqs.filter(unique)]);
    const ledgers = res.map(v => new Ledger(v));

    return seqs.map<Ledger | null>(seq => ledgers.find(a => a.ledgerSeq === seq) || null);
  }

  // Returns max ledger number
  public findMaxSeq(): Promise<number> {
    return this.db.oneOrNone(sql.selectMaxLedger, null, res => res.ledgerseq);
  }
}
