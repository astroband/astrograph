import db from "../database";
import { Ledger, Transaction } from "../model";

export interface ICursorResult {
  ledger: Ledger;
  transactions: Transaction[];
}

// Walks through ledgers in ledgerheaders table.
export class Cursor {
  public static async build(seq?: number) {
    const dbh = db.ledgerHeaders;
    const n = seq === -1 ? await dbh.findMinSeq() : seq || (await dbh.findMaxSeq()) + 1;
    return new Cursor(n);
  }

  private seq: number;

  constructor(seq: number) {
    this.seq = seq;
  }

  // Returns next ledger object and transactions
  public async nextLedger(): Promise<ICursorResult | null> {
    const ledgerHeader = await db.ledgerHeaders.findBySeq(this.seq);

    // If there is no next ledger
    if (ledgerHeader == null) {
      const maxSeq = await db.ledgerHeaders.findMaxSeq();

      // And there is a ledger somewhere forward in history (it is the gap)
      if (this.seq < maxSeq) {
        this.seq = maxSeq; // Fast-rewing to lastest ledger
      }

      return null;
    }

    const ledger = new Ledger(this.seq);
    this.incrementSeq();
    const transactions = await db.transactions.findAllBySeq(this.seq);

    return { ledger, transactions };
  }

  // Increments current ledger number
  private incrementSeq() {
    this.seq += 1;
  }
}
