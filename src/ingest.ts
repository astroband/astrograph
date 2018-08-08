import logger from "./common/util/logger";

import { IDatabase } from "pg-promise";
import Ledger from "./ledger/ledger.model";

export default class Ingest {
  private db: IDatabase<any>;
  private seq: number;

  constructor(db: any, seq: number) {
    this.db = db;
    this.seq = seq || db.transaction_fees.findMaxSeq();
  }

  public tick() {
    const ledger = nextLedger();
    if (ledger) {
      this.fetchTransactions(ledger);
    }
  }

  private fetchTransactions(ledger: Ledger) {
    const fees = db.transaction_fees.findAllBySeq(ledger.ledgerSeq);
    const txs = db.transactions.findAllBySeq(ledger.ledgerSeq);
  }

  private nextLedger(): Ledger {
    const ledger = db.ledgers.findBySeq(this.nextSeq());

    // If there is no next ledger
    if (ledger == null) {
      // And there is a ledger somewhere forward in history (it is the gap)
      if (this.gap()) {
        // this.update() // Resend current states to all subscriptions
        this.seq = this.findMaxSeq(); // Start from last known ledger
      }

      return;
    }

    this.incrementLedger();
    return ledger;
  }

  // Returns next sequence number
  private nextSeq(): number {
    return this.seq + 1;
  }

  // Increments current ledger number
  private incrementLedger() {
    this.ledgerSeq += 1;
  }

  // Returns true if next ledger is not the highest one
  private gap(): boolean {
    return this.nextSeq() < this.findMaxSeq();
  }
}
