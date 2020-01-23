import { db } from "../database";
import { Publisher } from "../pubsub";
import { setBaseReserve } from "../util/base_reserve";
import { Cursor } from "./cursor";

export class Worker {
  public cursor: Cursor;

  constructor(cursor: Cursor) {
    this.cursor = cursor;
  }

  public async run(): Promise<boolean> {
    const header = await this.cursor.nextLedger();

    if (header) {
      const transactions = await db.transactions.findAllBySeq(header.ledgerSeq);

      setBaseReserve(header.baseReserve);
      await Publisher.publish(header, transactions);
      return true;
    }

    return false;
  }
}
