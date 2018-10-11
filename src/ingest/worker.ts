import { Publisher } from "../pubsub";
import { Cursor } from "./cursor";

import { SubscriptionPayloadCollection } from "./subscription_payload_collection";

import { Connection } from "../storage";
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
      await Publisher.publish(header, collection);

      if (DGRAPH_URL) {
        const c = new Connection();
        //const ledger =
        await c.store.ledger(header);

        for (const transaction of transactions) {
          // const tx =
          await c.store.transaction(transaction);
          // tx;

          // for (let index = 0; index < transaction.operationsXDR().length; index++) {
          //   await store.operation(transaction, index, { ledger, tx });
          // }
        }

        c.close();
      }
    }
  }
}
