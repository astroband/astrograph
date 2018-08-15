import { IDatabase } from "pg-promise";
import { Ledger } from "../model";

export default class LedgersRepo {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a ledger from id;
  public findBySeq(seq: string | number): Promise<Ledger> {
    return this.db.oneOrNone("SELECT * FROM ledgerheaders WHERE ledgerseq = $1", seq, res => new Ledger(res));
  }

  // Returns max ledger number
  public findMaxSeq(): Promise<number> {
    return this.db.oneOrNone(
      "SELECT ledgerseq FROM ledgerheaders ORDER BY ledgerseq DESC LIMIT 1",
      null,
      res => res.ledgerseq
    );
  }
}
