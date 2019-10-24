import PostgresPubSub from "@astroband/graphql-postgres-subscriptions";
import { Client } from "pg";
import stellar from "stellar-base";
import { getCustomRepository } from "typeorm";
import { SubscriptionPayloadCollection } from "./ingest/subscription_payload_collection";
import { Ledger, LedgerHeader, OfferSubscriptionPayload, TransactionWithXDR } from "./model";
import { OfferRepository } from "./orm/repository/offer";
import extractOperation from "./util/extract_operation";
import logger from "./util/logger";
import { DATABASE_URL } from "./util/secrets";

const pgClient = new Client({ connectionString: DATABASE_URL });

export const pubsub = new PostgresPubSub(pgClient, (key: string, value: any) => {
  if (value && value.hasOwnProperty("code")) {
    return value.code && value.issuer ? new stellar.Asset(value.code, value.issuer) : stellar.Asset.native();
  }

  return value;
});

export const LEDGER_CREATED = "LEDGER_CREATED";

// Account events concern all operations happened with account itself and it's signers.
// TrustLines/DataEntries are not involved.
export const ACCOUNT = "ACCOUNT";
export const BALANCE = "BALANCE";
export const DATA_ENTRY = "DATA_ENTRY";
export const OFFER = "OFFER";
export const NEW_OPERATION = "NEW_OPERATION";
export const OFFERS_TICK = "OFFERS_TICK";

export async function connect(): Promise<void> {
  await pgClient
    .connect()
    .then(() => logger.debug("Connected to PG pubsub"))
    .catch(err => logger.error(`Error connecting to PG pubsub: ${err}`));
}

export class Publisher {
  public static async publish(header: LedgerHeader, transactions: TransactionWithXDR[]) {
    const collection = new SubscriptionPayloadCollection(transactions);

    pubsub.publish(LEDGER_CREATED, new Ledger(header.ledgerSeq, header));

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
      const [selling, buying] = tick.split("/");
      const repo = getCustomRepository(OfferRepository);

      const bestAsk = await repo.findBestAsk(selling, buying);
      const bestAskInv = await repo.findBestAsk(buying, selling);
      const bestBid = bestAskInv ? 1 / bestAskInv : null;

      pubsub.publish(OFFERS_TICK, { selling, buying, bestAsk, bestBid });
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
