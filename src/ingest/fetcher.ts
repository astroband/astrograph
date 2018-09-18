import db from "../database";
import { Ledger } from "../model";
import { Collection } from "./collection";

export class Fetcher {
  public ledger: Ledger;

  constructor(ledger: Ledger) {
    this.ledger = ledger;
  }

  public async fetch(): Promise<Collection> {
    const changes = new Collection();

    const fees = await this.fetchTransactionFees(this.ledger);
    const txChanges = await this.fetchTransactions(this.ledger);

    changes.concatXDR(fees);
    changes.concatXDR(txChanges);

    return changes;
  }

  private async fetchTransactionFees(ledger: Ledger): Promise<any[]> {
    const fees = await db.transactionFees.findAllBySeq(ledger.seq);
    const result: any[] = [];

    for (const fee of fees) {
      result.push(...fee.changesFromXDR().changes());
    }

    return result;
  }

  private async fetchTransactions(ledger: Ledger): Promise<any[]> {
    const txs = await db.transactions.findAllBySeq(ledger.seq);
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
}
