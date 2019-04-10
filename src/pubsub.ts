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
  if (value && value.hasOwnProperty("code")) {
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
export const BALANCE = "BALANCE";
export const DATA_ENTRY = "DATA_ENTRY";
export const OFFER = "OFFER";
export const NEW_OPERATION = "NEW_OPERATION";
export const OFFERS_TICK = "OFFERS_TICK";

export class Publisher {
  public static async publish(header: LedgerHeader, transactions: TransactionWithXDR[]) {
    const collection = new SubscriptionPayloadCollection(transactions);

    pubsub.publish(LEDGER_CREATED, new Ledger(header.ledgerSeq));

    const assetsBidTicks: Set<string> = new Set();

    for (const entry of collection) {
      for (const m of Publisher.eventMap) {
        if (m.payloadClassName !== entry.constructor.name) {
          continue;
        }

        pubsub.publish(m.event, entry);

        if (entry instanceof OfferSubscriptionPayload) {
          assetsBidTicks.add(`${entry.selling}/${entry.buying}`);
        }
      }
    }

    assetsBidTicks.forEach(async tick => {
      const [selling, buying] = tick.split("/").map(id => AssetFactory.fromId(id));
      const bestAsk = await db.offers.getBestAsk(selling, buying);
      const bestAskInv = await db.offers.getBestAsk(buying, selling);

      pubsub.publish(OFFERS_TICK, {
        selling: selling.toString(),
        buying: buying.toString(),
        bestAsk,
        bestBid: 1 / bestAskInv
      });
    });

    for (const tx of transactions) {
      for (let index = 0; index < tx.operationsXDR.length; index++) {
        pubsub.publish(NEW_OPERATION, extractOperation(tx, index));
      }
    }
  }

  private static eventMap = [
    { payloadClassName: "AccountSubscriptionPayload", event: ACCOUNT },
    { payloadClassName: "BalanceSubscriptionPayload", event: BALANCE },
    { payloadClassName: "NativeBalanceSubscriptionPayload", event: BALANCE },
    { payloadClassName: "DataEntrySubscriptionPayload", event: DATA_ENTRY },
    { payloadClassName: "OfferSubscriptionPayload", event: OFFER }
  ];
}
