import logger from "./common/util/logger";
import db from "./database";

import { Ledger } from "./model";
// import { ACCOUNT_CREATED, ACCOUNT_UPDATED, ACCOUNT_DELETED, pubsub } from "./pubsub";

export class Ingest {
  private seq: number;

  constructor(seq: number) {
    this.seq = seq;
  }

  public async tick() {
    logger.info(`Ingesting ${this.seq}`);

    const ledger = await this.nextLedger();
    if (ledger !== null) {
      logger.info("PumPumPum");
    }
  }

  private async nextLedger(): Promise<Ledger | null> {
    const ledger = await db.ledgers.findBySeq(this.nextSeq());

    // If there is no next ledger
    if (ledger == null) {
      const maxSeq = await db.ledgers.findMaxSeq();

      // And there is a ledger somewhere forward in history (it is the gap)
      if (this.seq < maxSeq) {
        this.seq = maxSeq; // Skip gap.
      }

      return null;
    }

    this.incrementSeq();

    return ledger;
  }

  // WIP
  private fetchTransactions(ledger: Ledger) {
    const fees = db.transactionFees.findAllBySeq(ledger.ledgerSeq);
    const txs = db.transactions.findAllBySeq(ledger.ledgerSeq);

    cosnt id = [];

    for (let fee of fees) {
      // console.log(fee)
    }
  }

  // Returns next sequence number
  private nextSeq(): number {
    return this.seq + 1;
  }

  // Increments current ledger number
  private incrementSeq() {
    this.seq += 1;
  }

  // Factory function
  public static async build(seq: number | null = null) {
    const n = seq || await db.ledgers.findMaxSeq();
    return new Ingest(n);
  }

  // Starts ingest
  public static async start() {
    const seq = Number.parseInt(process.env.DEBUG_LEDGER || "");
    const interval = Number.parseInt(process.env.INGEST_INTERVAL || "") || 2000;
    const ingest = await Ingest.build(seq);

    logger.info(`Staring ingest every ${interval} ms.`);

    setInterval(() => ingest.tick(), interval);
  }
}

export default Ingest;
