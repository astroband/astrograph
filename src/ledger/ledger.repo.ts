import { IDatabase } from "pg-promise";
import Ledger from "./ledger.model";

export default class LedgersRepository {
  private db: IDatabase<any>;

  constructor(db: any) {
    this.db = db;
  }

  // Tries to find a ledger from id;
  public findBySeq(seq: string): Promise<Ledger> {
    return this.db.oneOrNone("SELECT * FROM ledgerheaders WHERE ledgerseq = $1", seq, res => new Ledger(res));
  }

  // Returns max ledger number
  public fetchMaxLedgerSeq(): Promise<number> {
    return this.db.oneOrNone(
      "SELECT ledgerseq FROM ledgerheaders ORDER BY ledgerseq DESC LIMIT 1",
      null,
      res => res.ledgerseq
    );
  }
}
