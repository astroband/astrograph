import { IDatabase } from "pg-promise";
import Ledger from "./ledger/ledger.model";

export default class Ingest {
  private db: IDatabase<any>;
  private seq: number;

  constructor(db: any, seq: number) {
    this.db = db;
    this.seq = seq || db.transaction_fees.findMaxSeq();
  }

  public next(): Ledger {
    const ledger = db.ledgers.findBySeq(this.ledgerSeq + 1);
    if (ledger == null) {
      return;
    }
    this.ledgerSeq += 1;
    return ledger;
  }
}
