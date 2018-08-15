import db from "./database";
// import logger from "./common/util/logger";

// import { Ledger } from "./model";
// import { ACCOUNT_CREATED, ACCOUNT_UPDATED, ACCOUNT_DELETED, pubsub } from "./pubsub";

export class Ingest {
  private seq: number;

  constructor(seq: number) {
    this.seq = seq;
  }

  public async tick() {
    //console.log("TICK" + this.seq.toString());
    // const ledger = await this.nextLedger()
    // if (ledger !== null) {
    //   this.fetchTransactions(ledger);
    // }
  }

  // private fetchTransactions(ledger: Ledger) {
    // const fees = db.transactionFees.findAllBySeq(ledger.ledgerSeq);
    // const txs = db.transactions.findAllBySeq(ledger.ledgerSeq);

    // cosnt id = [];

    // for (let fee of fees) {
    //   // console.log(fee)
    // }
  // }

  // private async nextLedger(): Promise<Ledger | null> {
  //   const ledger = await db.ledgers.findBySeq(this.nextSeq());
  //
  //   // If there is no next ledger
  //   if (ledger == null) {
  //     // And there is a ledger somewhere forward in history (it is the gap)
  //     if (this.gap()) {
  //       // this.update() // Resend current states to all subscriptions
  //       this.seq = await this.findMaxSeq(); // Start from last known ledger
  //     }
  //
  //     return null;
  //   }
  //
  //   this.incrementLedger();
  //   return ledger;
  // }
  //
  // // Current maximum sequence number
  // private async findMaxSeq(): number {
  //   return await db.ledgers.findMaxSeq();
  // }
  //
  // // Returns next sequence number
  // private nextSeq(): number {
  //   return this.seq + 1;
  // }
  //
  // // Increments current ledger number
  // private incrementLedger() {
  //   this.seq += 1;
  // }
  //
  // // Returns true if next ledger is not the highest one
  // private async gap(): boolean {
  //   return this.nextSeq() < await this.findMaxSeq();
  // }

  // Factory function
  public static async build(seq: number | null = null) {
    const n = seq || await db.ledgers.findMaxSeq();
    return new Ingest(n);
  }

  // Starts ingest
  public static async start() {
    const seq = process.env.DEBUG_LEDGER == null ? null : Number.parseInt(process.env.DEBUG_LEDGER);
    const interval = process.env.INGEST_INTERVAL == null ? 2000 : Number.parseInt(process.env.INGEST_INTERVAL);
    const ingest = await Ingest.build(seq);

    setInterval(() => ingest.tick(), interval);
  }
}

export default Ingest;
