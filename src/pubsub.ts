import PostgresPubSub from "@astroband/graphql-postgres-subscriptions";
import { Client } from "pg";
import { Asset } from "stellar-base";
import { SubscriptionPayloadCollection } from "./ingest/subscription_payload_collection";
import { Ledger, LedgerHeader, OfferSubscriptionPayload, Transaction, TransactionWithXDR } from "./model";
import { OfferRepository } from "./orm";
import { OperationsStorage } from "./storage/operations";
import logger from "./util/logger";
import { DATABASE_URL } from "./util/secrets";

const pgClient = new Client({ connectionString: DATABASE_URL });

export const pubsub = new PostgresPubSub(pgClient, (key: string, value: any) => {
  if (value && value.hasOwnProperty("code")) {
    return value.code && value.issuer ? new Asset(value.code, value.issuer) : Asset.native();
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
export const NEW_TRANSACTION = "NEW_TRANSACTION";
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

    await pubsub.publish(LEDGER_CREATED, new Ledger(header.ledgerSeq, header));

    const assetsBidTicks: Set<string> = new Set();

    for (const entry of collection) {
      for (const m of Publisher.eventMap) {
        if (m.payloadClassName !== entry.constructor.name) {
          continue;
        }

        await pubsub.publish(m.event, entry);

        if (entry instanceof OfferSubscriptionPayload) {
          assetsBidTicks.add(`${entry.selling}/${entry.buying}`);
        }
      }
    }

    assetsBidTicks.forEach(async tick => {
      const [selling, buying] = tick.split("/");

      const bestAsk = await OfferRepository.findBestAsk(selling, buying);
      const bestAskInv = await OfferRepository.findBestAsk(buying, selling);
      const bestBid = bestAskInv ? 1 / bestAskInv : null;

      return pubsub.publish(OFFERS_TICK, { selling, buying, bestAsk, bestBid });
    });

    for (const tx of transactions) {
      await pubsub.publish(NEW_TRANSACTION, new Transaction(tx));

      const operations = await OperationsStorage.forTransaction(tx.id);

      for (const operation of operations) {
        await pubsub.publish(NEW_OPERATION, operation);
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
