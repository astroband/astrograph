import { PubSub } from "graphql-subscriptions";
import { Collection } from "./ingest/collection";
import { Ledger } from "./model";

export const pubsub = new PubSub();

export const LEDGER_CREATED = "LEDGER_CREATED";

// Account events concern all operations happened with account itself and it's signers.
// TrustLines/DataEntries are not involved.
export const ACCOUNT = "ACCOUNT";
export const TRUST_LINE = "TRUST_LINE";
export const DATA_ENTRY = "DATA_ENTRY";

export class Publisher {
  private static eventMap = [
    { payloadClassName: "AccountSubscriptionPayload", event: ACCOUNT },
    { payloadClassName: "TrustLineSubscriptionPayload", event: TRUST_LINE },
    { payloadClassName: "DataEntrySubscriptionPayload", event: DATA_ENTRY }
  ];

  private ledger: Ledger;
  private collection: Collection;

  constructor(ledger: Ledger, collection: Collection) {
    this.ledger = ledger;
    this.collection = collection;
  }

  public async publish() {
    pubsub.publish(LEDGER_CREATED, this.ledger);

    for (const entry of this.collection) {
      const payloadClassName = entry.constructor.name;

      for (const m of Publisher.eventMap) {
        if (m.payloadClassName === payloadClassName) {
          pubsub.publish(m.event, entry);
        }
      }
    }
  }
}
