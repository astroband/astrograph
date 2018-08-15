import logger from "./common/util/logger";
import db from "./database";
import stellar from "stellar-base";

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

    for (let fee of fees) {
      const changes = fee.changesFromXDR().changes();
      //const id = fetchAccountIDFromLedgerEntry();

      for (let change of changes) {
        console.log(this.getAccountIDFromLedgerEntryChange(change));
      }
    }

    // for (let tx of txs) {
    //   console.log(tx.metaFromXDR().changes().switch().name)
    // }
  }

  private getAccountIDFromLedgerEntryChange(change: any): string | null {
    const ct = stellar.xdr.LedgerEntryChangeType;
    const et = stellar.xdr.LedgerEntryType;

    let data = null;
    let id = null;

    switch (change.switch()) {
      case ct.ledgerEntryCreated():
        data = change.created().data();
      break;

      case ct.ledgerEntryUpdated():
        data = change.updated().data();
      break;

      case ct.ledgerEntryRemoved():
        data = change.removed();
      break;
    }

    if (data === null) {
      return null;
    }

    switch (data.switch()) {
      case et.account():
        id = data.account().accountId().value();
      break;

      case et.trustline():
        id = data.trustLine().accountId().value();
      break;

      case et.data():
        id = data.data().accountId().value();
      break;

      case et.offer():
        id = data.offer().sellerId().value();
      break;

    }

    if (id !== null) {
      return stellar.StrKey.encodeEd25519PublicKey(id);
    }

    return null;
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
