import { Collection } from "./collection";

import { ACCOUNT, DATA_ENTRY, LEDGER_CREATED, pubsub, TRUST_LINE } from "../pubsub";

import { Ledger } from "../model";

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
