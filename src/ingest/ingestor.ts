import logger from "../common/util/logger";
import db from "../database";
import { Ledger } from "../model";
import { Collection } from "./collection";

export class Ingestor {
  // Factory function
  public static async build(seq: number | null = null, tickFn: any) {
    const n = seq || (await db.ledgerHeaders.findMaxSeq()) + 1;
    return new Ingestor(n, tickFn);
  }

  private seq: number;
  private tickFn: any;

  constructor(seq: number, tickFn: any) {
    this.seq = seq;
    this.tickFn = tickFn;
  }

  public async tick() {
    logger.info(`Ingesting ${this.seq}`);

    const ledger = await this.nextLedger();
    if (ledger !== null) {
      this.fetch(ledger);
    }
  }

  private async nextLedger(): Promise<Ledger | null> {
    const ledgerHeader = await db.ledgerHeaders.findBySeq(this.seq);

    // If there is no next ledger
    if (ledgerHeader == null) {
      const maxSeq = await db.ledgerHeaders.findMaxSeq();

      // And there is a ledger somewhere forward in history (it is the gap)
      if (this.seq < maxSeq) {
        this.seq = maxSeq; // Skip gap.
      }

      return null;
    }

    this.incrementSeq();

    return new Ledger(this.seq);
  }

  private async fetch(ledger: Ledger) {
    const changes = new Collection();

    await this.fetchTransactionFees(ledger, changes);
    await this.fetchTransactions(ledger, changes);

    this.tickFn(ledger, changes);
  }

  private async fetchTransactionFees(ledger: Ledger, collection: Collection) {
    const fees = await db.transactionFees.findAllBySeq(ledger.seq);

    for (const fee of fees) {
      const changes = fee.changesFromXDR().changes();
      collection.concatXDR(changes);
    }

    return collection;
  }

  private async fetchTransactions(ledger: Ledger, collection: Collection) {
    const txs = await db.transactions.findAllBySeq(ledger.seq);

    for (const tx of txs) {
      const xdr = tx.metaFromXDR();

      switch (xdr.switch()) {
        case 0:
          for (const op of xdr.operations()) {
            collection.concatXDR(op.changes());
          }
          break;
        case 1:
          collection.concatXDR(xdr.v1().txChanges());

          for (const op of xdr.v1().operations()) {
            collection.concatXDR(op.changes());
          }

          break;
      }
    }
  }

  // Increments current ledger number
  private incrementSeq() {
    this.seq += 1;
  }
}

export default Ingestor;
