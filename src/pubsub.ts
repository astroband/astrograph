import PostgresPubSub from "@udia/graphql-postgres-subscriptions";
import { Client } from "pg";
import { db } from "./database";
import { SubscriptionPayloadCollection } from "./ingest/subscription_payload_collection";
import { Ledger, LedgerHeader } from "./model";
import logger from "./util/logger";

const pgClient = new Client(db.$cn as string);
export const pubsub = new PostgresPubSub(pgClient);
pgClient
  .connect()
  .then(() => logger.debug("Connected to PG pubsub"))
  .catch(err => logger.error(`Error connecting to PG pubsub: ${err}`));

export const LEDGER_CREATED = "LEDGER_CREATED";

// Account events concern all operations happened with account itself and it's signers.
// TrustLines/DataEntries are not involved.
export const ACCOUNT = "ACCOUNT";
export const TRUST_LINE = "TRUST_LINE";
export const DATA_ENTRY = "DATA_ENTRY";
export const OFFER = "OFFER";

export class Publisher {
  public static async publish(header: LedgerHeader, collection: SubscriptionPayloadCollection) {
    pubsub.publish(LEDGER_CREATED, new Ledger(header.ledgerSeq));

    for (const entry of collection) {
      const payloadClassName = entry.constructor.name;

      for (const m of Publisher.eventMap) {
        if (m.payloadClassName === payloadClassName) {
          pubsub.publish(m.event, entry);
        }
      }
    }
  }

  private static eventMap = [
    { payloadClassName: "AccountSubscriptionPayload", event: ACCOUNT },
    { payloadClassName: "TrustLineSubscriptionPayload", event: TRUST_LINE },
    { payloadClassName: "NativeTrustLineSubscriptionPayload", event: TRUST_LINE },
    { payloadClassName: "DataEntrySubscriptionPayload", event: DATA_ENTRY },
    { payloadClassName: "OfferSubscriptionPayload", event: OFFER }
  ];
}
