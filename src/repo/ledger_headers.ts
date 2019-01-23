import { IDatabase } from "pg-promise";
import { LedgerHeader } from "../model";
import { LedgerHeaderFactory } from "../model/factories";
import { unique } from "../util/array";

const sql = {
  selectLedger: "SELECT * FROM ledgerheaders WHERE ledgerseq = $1",
  selectLedgersIn: "SELECT * FROM ledgerheaders WHERE ledgerseq IN ($1:csv) ORDER BY ledgerseq",
  selectMaxLedger: "SELECT ledgerseq FROM ledgerheaders ORDER BY ledgerseq DESC LIMIT 1",
  selectMinLedger: "SELECT ledgerseq FROM ledgerheaders ORDER BY ledgerseq ASC LIMIT 1",
  selectFirstAfter: "SELECT * FROM ledgerheaders WHERE ledgerseq > $1 LIMIT 1",
  selectCountIn: "SELECT COUNT(*) FROM ledgerheaders WHERE ledgerseq >= $1 AND ledgerseq <= $2"
};

export default class LedgerHeadersRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a ledger from id;
  public findBySeq(seq: number): Promise<LedgerHeader | null> {
    return this.db.oneOrNone(sql.selectLedger, seq, res => (res === null ? null : LedgerHeaderFactory.fromDb(res)));
  }

  public findFirstAfterBySeq(seq: number): Promise<LedgerHeader | null> {
    return this.db.oneOrNone(sql.selectFirstAfter, seq, res => (res === null ? null : LedgerHeaderFactory.fromDb(res)));
  }

  public countInRange(min: number, max: number): Promise<number> {
    return this.db.one(sql.selectCountIn, [min, max], c => +c.count);
  }

  public async findAllBySeq(seqs: number[]): Promise<Array<LedgerHeader | null>> {
    if (seqs.length === 0) {
      return new Array<LedgerHeader | null>();
    }

    const res = await this.db.manyOrNone(sql.selectLedgersIn, [seqs.filter(unique)]);
    const ledgers = res.map(v => LedgerHeaderFactory.fromDb(v));

    return seqs.map<LedgerHeader | null>(seq => ledgers.find(a => a.ledgerSeq === seq) || null);
  }

  // Returns max ledger number
  public findMaxSeq(): Promise<number> {
    return this.db.oneOrNone(sql.selectMaxLedger, null, res => res.ledgerseq);
  }

  // Returns min ledger number
  public findMinSeq(): Promise<number> {
    return this.db.oneOrNone(sql.selectMinLedger, null, res => res.ledgerseq);
  }
}
