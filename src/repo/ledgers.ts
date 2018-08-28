import { IDatabase } from "pg-promise";
import { Ledger } from "../model";

const sql = {
  selectLedger: "SELECT * FROM ledgerheaders WHERE ledgerseq = $1",
  selectMaxLedger: "SELECT ledgerseq FROM ledgerheaders ORDER BY ledgerseq DESC LIMIT 1"
};

export default class LedgersRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a ledger from id;
  public findBySeq(seq: string | number): Promise<Ledger | null> {
    return this.db.oneOrNone(sql.selectLedger, seq, res => (res === null ? null : new Ledger(res)));
  }

  // Returns max ledger number
  public findMaxSeq(): Promise<number> {
    return this.db.oneOrNone(sql.selectMaxLedger, null, res => res.ledgerseq);
  }
}
