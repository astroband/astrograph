import db from "../database";
import { Transaction } from "../model";

export interface ICursorResult {
  seq: number;
  transactions: Transaction[];
}

// Walks through ledgers in ledgerheaders table.
export class Cursor {
  public static async build(seq?: number) {
    const n = seq === -1 ? await db.ledgerHeaders.findMinSeq() : seq || (await db.ledgerHeaders.findMaxSeq()) + 1;
    return new Cursor(n);
  }

  private seq: number;

  constructor(seq: number) {
    this.seq = seq;
  }

  get current(): number {
    return this.seq;
  }

  // Returns next ledger object and transactions
  public async nextLedger(): Promise<ICursorResult | null> {
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
    const transactions = await db.transactions.findAllBySeq(this.seq);

    return { seq: this.seq, transactions };
  }

  // Increments current ledger number
  private incrementSeq() {
    this.seq += 1;
  }
}
