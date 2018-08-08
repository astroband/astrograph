import { IDatabase } from "pg-promise";

export default class Ingest {
  private db: IDatabase<any>;
  private ledgerSeq: number;

  constructor(db: any, ledgerSeq: number) {
    this.db = db;
    this.ledgerSeq = ledgerSeq || db.transaction_fees.fetchMaxLedgerSeq();
  }
}
