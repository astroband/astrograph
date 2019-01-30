import { Publisher } from "../pubsub";
import { Cursor } from "./cursor";

import { SubscriptionPayloadCollection } from "./subscription_payload_collection";

import { Connection } from "../storage/connection";
import { DGRAPH_INGEST_URL } from "../util/secrets";

export class Worker {
  public cursor: Cursor;

  constructor(cursor: Cursor) {
    this.cursor = cursor;
  }

  public async run(): Promise<boolean> {
    const result = await this.cursor.nextLedger();

    if (result) {
      const { header, transactions } = result;

      const collection = new SubscriptionPayloadCollection(transactions);
      await Publisher.publish(header, collection);

      if (DGRAPH_INGEST_URL) {
        const c = new Connection(DGRAPH_INGEST_URL);
        await c.importLedger(header, transactions);
        c.close();
      }

      return true;
    }

    return false;
  }
}
