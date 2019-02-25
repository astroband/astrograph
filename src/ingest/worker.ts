import { Publisher } from "../pubsub";
import { Cursor } from "./cursor";

import { SubscriptionPayloadCollection } from "./subscription_payload_collection";

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

      const collection = new SubscriptionPayloadCollection(transactions);
      await Publisher.publish(header, collection);

      if (DGRAPH_INGEST_URL) {
        const c = new Connection(DGRAPH_INGEST_URL);
        const stateParser = new LedgerStateParser(transactions);
        stateParser.parse();
        await c.importLedger(header, transactions, { ingestOffers: true });
        await c.deleteByPredicates({
          "offer.id": stateParser.deletedOfferIds,
          "account.id": stateParser.deletedAccountIds
        });
        c.close();
      }

      return true;
    }

    return false;
  }
}
