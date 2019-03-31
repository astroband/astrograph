import { Publisher } from "../pubsub";
import { Cursor } from "./cursor";

export class Worker {
  public cursor: Cursor;

  constructor(cursor: Cursor) {
    this.cursor = cursor;
  }

  public async run(): Promise<boolean> {
    const result = await this.cursor.nextLedger();

    if (result) {
      const { header, transactions } = result;
      await Publisher.publish(header, transactions);
      return true;
    }

    return false;
  }
}
