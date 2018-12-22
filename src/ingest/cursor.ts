import { db } from "../database";
import { LedgerHeader } from "../model2";
import { TransactionWithXDR } from "../model2/transaction_with_xdr";

export interface ICursorResult {
  header: LedgerHeader;
  transactions: TransactionWithXDR[];
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

  get current(): number {
    return this.seq;
  }

  // Returns next ledger object and transactions
  public async nextLedger(): Promise<ICursorResult | null> {
    const header = await db.ledgerHeaders.findBySeq(this.seq);

    // If there is no next ledger
    if (header == null) {
      const maxSeq = await db.ledgerHeaders.findMaxSeq();

      // And there is a ledger somewhere forward in history (it is the gap)
      if (this.seq < maxSeq) {
        this.seq = maxSeq; // Fast-rewind to lastest ledger
      }

      return null;
    }

    const transactions = await db.transactions.findAllBySeq(this.seq);
    this.incrementSeq();

    return { header, transactions };
  }

  // Increments current ledger number
  private incrementSeq() {
    this.seq += 1;
  }
}
