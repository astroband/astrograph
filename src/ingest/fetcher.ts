import { Transaction } from "../model";
import { Collection } from "./collection";

export class Fetcher {
  public transactions: Transaction[];

  constructor(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  public fetch(): Collection {
    const collection = new Collection();

    const fees = this.fetchFees(this.transactions);
    const changes = this.fetchChanges(this.transactions);

    collection.concatXDR(fees);
    collection.concatXDR(changes);

    return collection;
  }

  private fetchFees(transactions: Transaction[]): any[] {
    const result: any[] = [];

    for (const tx of transactions) {
      result.push(...tx.feeMetaFromXDR().changes());
    }

    return result;
  }

  private fetchChanges(transactions: Transaction[]): any[] {
    const result: any[] = [];

    for (const tx of transactions) {
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
