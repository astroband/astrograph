import { Connection, Store } from "../storage";
import { LedgerHeader, Transaction } from "../model";

export class DgraphIngestor {
  private store: Store;

  constructor(dgraphConnection: Connection) {
    this.store = dgraphConnection.store;
  }

  public async ingestLedger(header: LedgerHeader, transactions: Transaction[]) {
    await this.store.ledger(header);

    for (const transaction of transactions) {
      await this.store.transaction(transaction);

      for (let index = 0; index < transaction.operationsXDR().length; index++) {
        await this.store.operation(transaction, index);
      }
    }
  }
}
