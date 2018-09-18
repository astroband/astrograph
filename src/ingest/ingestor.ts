import logger from "../common/util/logger";
import db from "../database";
import { LedgerHeader } from "../model";
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

    const ledgerHeader = await this.nextLedger();
    if (ledgerHeader !== null) {
      this.fetch(ledgerHeader);
    }
  }

  private async nextLedger(): Promise<LedgerHeader | null> {
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

    return ledgerHeader;
  }

  private async fetch(ledgerHeader: LedgerHeader) {
    const changes = new Collection();

    const fees = await this.fetchTransactionFees(ledgerHeader.ledgerSeq);
    const txChanges = await this.fetchTransactions(ledgerHeader.ledgerSeq);

    changes.concatXDR(fees);
    changes.concatXDR(txChanges);

    this.tickFn(ledgerHeader, changes);
  }

  private async fetchTransactionFees(ledgerSeq: number): Promise<any[]> {
    const fees = await db.transactionFees.findAllBySeq(ledgerSeq);
    const result: any[] = [];

    for (const fee of fees) {
      result.push(...fee.changesFromXDR().changes());
    }

    return result;
  }

  private async fetchTransactions(ledgerSeq: number): Promise<any[]> {
    const txs = await db.transactions.findAllBySeq(ledgerSeq);
    const result: any[] = [];

    for (const tx of txs) {
      const xdr = tx.metaFromXDR();

      switch (xdr.switch()) {
        case 0:
          for (const op of xdr.operations()) {
            result.push(...op.changes());
          }
          break;
        case 1:
          result.push(...xdr.v1().txChanges());
          for (const op of xdr.v1().operations()) {
            result.push(...op.changes());
          }
          break;
      }
    }

    return result;
  }

  // Increments current ledger number
  private incrementSeq() {
    this.seq += 1;
  }
}

export default Ingestor;
