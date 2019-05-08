import { Publisher } from "../pubsub";
import { setBaseReserve } from "../util/base_reserve";
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
      setBaseReserve(header.baseReserve);
      await Publisher.publish(header, transactions);
      return true;
    }

    return false;
  }
}
