import { Publisher } from "../pubsub";
import { Cursor } from "./cursor";
import { SubscriptionPayloadCollection } from "./subscription_payload_collection";

export class Worker {
  public cursor: Cursor;

  constructor(cursor: Cursor) {
    this.cursor = cursor;
  }

  public async run() {
    const result = await this.cursor.nextLedger();

    if (result) {
      const { seq, transactions } = result;

      const collection = new SubscriptionPayloadCollection(transactions);
      new Publisher(seq, collection).publish();
    }
  }
}
