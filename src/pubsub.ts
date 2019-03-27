import PostgresPubSub from "@udia/graphql-postgres-subscriptions";
import { Client } from "pg";
import { db } from "./database";
import { SubscriptionPayloadCollection } from "./ingest/subscription_payload_collection";
import { Ledger, LedgerHeader, OfferSubscriptionPayload, TransactionWithXDR } from "./model";
import { AssetFactory } from "./model/factories/asset_factory";
import extractOperation from "./util/extract_operation";
import logger from "./util/logger";

const pgClient = new Client(db.$cn as string);

export const pubsub = new PostgresPubSub(pgClient, (key: string, value: any) => {
  if (value.hasOwnProperty("code")) {
    return AssetFactory.fromInput(value);
  }

  return value;
});

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
export const NEW_OPERATION = "NEW_OPERATION";
export const OFFERS_TICK = "OFFERS_TICK";

export class Publisher {
  public static async publish(header: LedgerHeader, transactions: TransactionWithXDR[]) {
    const collection = new SubscriptionPayloadCollection(transactions);

    pubsub.publish(LEDGER_CREATED, new Ledger(header.ledgerSeq));

    for (const entry of collection) {
      for (const m of Publisher.eventMap) {
        if (m.payloadClassName !== entry.constructor.name) {
          continue;
        }

        pubsub.publish(m.event, entry);

        if (entry instanceof OfferSubscriptionPayload) {
          const bestAsk = await db.offers.getBestAsk(entry.selling, entry.buying);
          const bestAskInv = await db.offers.getBestAsk(entry.buying, entry.selling);

          pubsub.publish(OFFERS_TICK, {
            selling: entry.selling.toString(),
            buying: entry.buying.toString(),
            bestAsk,
            bestBid: 1 / bestAskInv
          });
        }
      }
    }

    for (const tx of transactions) {
      for (let index = 0; index < tx.operationsXDR.length; index++) {
        pubsub.publish(NEW_OPERATION, extractOperation(tx, index));
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
