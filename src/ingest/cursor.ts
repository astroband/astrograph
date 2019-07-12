import { getCustomRepository } from "typeorm";
import { db } from "../database";
import { TransactionWithXDR } from "../model";
import { LedgerHeader } from "../orm/entities";
import { LedgerHeaderRepository } from "../orm/repository/ledger_header";

export interface ICursorResult {
  header: LedgerHeader;
  transactions: TransactionWithXDR[];
}

// Walks through ledgers in ledgerheaders table.
export class Cursor {
  public static async build(seq?: number) {
    const ledgerHeadersRepo = getCustomRepository(LedgerHeaderRepository);
    const n = seq === -1 ? await ledgerHeadersRepo.findMinSeq() : seq || (await ledgerHeadersRepo.findMaxSeq()) + 1;
    return new Cursor(n);
  }

  constructor(private seq: number) {}

  get current(): number {
    return this.seq;
  }

  // Returns next ledger object and transactions
  public async nextLedger(): Promise<ICursorResult | null> {
    const ledgerHeadersRepo = getCustomRepository(LedgerHeaderRepository);
    const header = await ledgerHeadersRepo.findBySeq(this.seq);

    // If there is no next ledger
    if (header == null) {
      const maxSeq = await ledgerHeadersRepo.findMaxSeq();

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
