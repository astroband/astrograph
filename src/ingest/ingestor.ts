import logger from "../common/util/logger";
import db from "../database";
import { LedgerChangesArray } from "./ledger_changes_array";
//import { LedgerChangesSubjectRepo } from "./ledger_changes_subject_repo";

import { Ledger } from "../model";
// import { ACCOUNT_CREATED, ACCOUNT_UPDATED, ACCOUNT_DELETED, pubsub } from "./pubsub";

export class Ingestor {
  private seq: number;

  constructor(seq: number) {
    this.seq = seq;
  }

  public async tick() {
    logger.info(`Ingesting ${this.seq}`);

    const ledger = await this.nextLedger();
    if (ledger !== null) {
      this.fetchTransactions(ledger);
    }
  }

  private async nextLedger(): Promise<Ledger | null> {
    const ledger = await db.ledgers.findBySeq(this.seq);

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

  private async fetchTransactions(ledger: Ledger) {
    const fees = await db.transactionFees.findAllBySeq(ledger.ledgerSeq);
    // const txs = await db.transactions.findAllBySeq(ledger.ledgerSeq);

    // cosnt id: string[] = [];

    const ledgerChanges = new LedgerChangesArray();

    for (let fee of fees) {
      const changes = fee.changesFromXDR().changes();
      ledgerChanges.concatXDR(changes);
    }
    //const subjects = new LedgerChangesSubjectRepo(repo.changes);
    //subjects.load();
    console.log(ledgerChanges);
    //console.log(subjects);

    // for (let tx of txs) {
    //   const xdr = tx.metaFromXDR();
    //
    //   switch (xdr.switch()) {
    //     case 0:
    //       for (let op in xdr.operations()) {
    //         console.log(op);
    //       }
    //       break;
    //     case 1:
    //       for (let change in xdr.v1().txChanges()) {
    //         console.log(change);
    //       }
    //
    //       for (let change in xdr.v1().operations()) {
    //         console.log(change);
    //       }
    //
    //       break;
    //   }
    // }
  }

  // Increments current ledger number
  private incrementSeq() {
    this.seq += 1;
  }

  // Factory function
  public static async build(seq: number | null = null) {
    const n = seq || await db.ledgers.findMaxSeq();
    return new Ingestor(n);
  }

  // Starts ingest
  public static async start() {
    const seq = Number.parseInt(process.env.DEBUG_LEDGER || "");
    const interval = Number.parseInt(process.env.INGEST_INTERVAL || "") || 2000;
    const ingest = await Ingestor.build(seq);

    logger.info(`Staring ingest every ${interval} ms.`);

    setInterval(() => ingest.tick(), interval);
  }
}

export default Ingestor;
