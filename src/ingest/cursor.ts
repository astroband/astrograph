import db from "../database";
import { Ledger } from "../model";

export class Cursor {
  // Factory function
  public static async build(seq?: number) {
    const n = seq || (await db.ledgerHeaders.findMaxSeq()) + 1;
    return new Cursor(n);
  }

  private seq: number;

  constructor(seq: number) {
    this.seq = seq;
  }

  public async nextLedger(): Promise<Ledger | null> {
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

    const ledger = new Ledger(this.seq);
    this.incrementSeq();

    return ledger;
  }

  // Increments current ledger number
  private incrementSeq() {
    this.seq += 1;
  }
}
