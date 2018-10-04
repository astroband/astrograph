import { Publisher } from "../pubsub";
import { Cursor } from "./cursor";

import { SubscriptionPayloadCollection } from "./subscription_payload_collection";

import { Connection, Store } from "../storage";
import { DGRAPH_URL } from "../util/secrets";

export class Worker {
  public cursor: Cursor;

  constructor(cursor: Cursor) {
    this.cursor = cursor;
  }

  public async run() {
    const result = await this.cursor.nextLedger();

    if (result) {
      const { header, transactions } = result;

      const collection = new SubscriptionPayloadCollection(transactions);
      Publisher(header, collection).publish();

      if (DGRAPH_URL) {
        const connection = new Connection();
        const store = new Store(connection);
        const ledgerUID = await store.ledger(header);

        for (const tx of transactions) {
          await store.transaction(tx, ledgerUID);
        }

        connection.close();
      }
    }
  }
}
