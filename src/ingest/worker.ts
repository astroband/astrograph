import { Publisher } from "../pubsub";
import { Cursor } from "./cursor";

import { LedgerStateParser } from "../ledger_state_parser";
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

      await Publisher.publish(header, transactions);

      if (DGRAPH_INGEST_URL) {
        const c = new Connection(DGRAPH_INGEST_URL);
        const stateParser = new LedgerStateParser(transactions);
        stateParser.parse();
        await c.importLedger(header, transactions, { ingestOffers: true });
        await c.deleteOffers(stateParser.deletedOfferIds);
        c.close();
      }

      return true;
    }

    return false;
  }
}
