import PostgresPubSub from "@udia/graphql-postgres-subscriptions";
import { Client } from "pg";
import { Asset } from "stellar-sdk";
import { db } from "./database";
import { SubscriptionPayloadCollection } from "./ingest/subscription_payload_collection";
import { Ledger, LedgerHeader, MutationType, OfferSubscriptionPayload, TransactionWithXDR } from "./model";
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

let offersCache: Map<string, { selling: Asset; buying: Asset }>;

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
          const offerAssets = offersCache.get(entry.offerId);

          if (offerAssets) {
            const selling = offerAssets.selling;
            const buying = offerAssets.buying;

            const bestAsk = await db.offers.getBestAsk(selling, buying);
            const bestAskInv = await db.offers.getBestAsk(buying, selling);

            pubsub.publish(OFFERS_TICK, {
              selling: selling.toString(),
              buying: buying.toString(),
              bestAsk,
              bestBid: 1 / bestAskInv
            });

            Publisher.updateOffersCache(entry);
          }
        }
      }
    }

    for (const tx of transactions) {
      for (let index = 0; index < tx.operationsXDR.length; index++) {
        pubsub.publish(NEW_OPERATION, extractOperation(tx, index));
      }
    }
  }

  public static async cacheOffers() {
    offersCache = await db.offers.getIdAssetsMap();
  }

  private static eventMap = [
    { payloadClassName: "AccountSubscriptionPayload", event: ACCOUNT },
    { payloadClassName: "TrustLineSubscriptionPayload", event: TRUST_LINE },
    { payloadClassName: "NativeTrustLineSubscriptionPayload", event: TRUST_LINE },
    { payloadClassName: "DataEntrySubscriptionPayload", event: DATA_ENTRY },
    { payloadClassName: "OfferSubscriptionPayload", event: OFFER }
  ];

  private static updateOffersCache(entry: OfferSubscriptionPayload) {
    switch (entry.mutationType) {
      case MutationType.Remove:
        offersCache.delete(entry.offerId);
        break;
      case MutationType.Create:
      case MutationType.Update:
        offersCache.set(entry.offerId, {
          selling: entry.selling!,
          buying: entry.buying!
        });
        break;
    }
  }
}
