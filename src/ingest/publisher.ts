import { Collection } from "./collection";

import {
  ACCOUNT_CREATED,
  ACCOUNT_REMOVED,
  ACCOUNT_UPDATED,
  DATA_ENTRY_CREATED,
  DATA_ENTRY_REMOVED,
  DATA_ENTRY_UPDATED,
  LEDGER_CREATED,
  pubsub,
  TRUST_LINE_CREATED,
  TRUST_LINE_REMOVED,
  TRUST_LINE_UPDATED
} from "../pubsub";

import { Ledger, MutationType } from "../model";

export class Publisher {
  private static eventMap = [
    { mutationType: MutationType.Create, payloadClassName: "AccountEventPayload", event: ACCOUNT_CREATED },
    { mutationType: MutationType.Update, payloadClassName: "AccountEventPayload", event: ACCOUNT_UPDATED },
    { mutationType: MutationType.Remove, payloadClassName: "AccountEventRemovePayload", event: ACCOUNT_REMOVED },
    { mutationType: MutationType.Create, payloadClassName: "TrustLineEventPayload", event: TRUST_LINE_CREATED },
    { mutationType: MutationType.Update, payloadClassName: "TrustLineEventPayload", event: TRUST_LINE_UPDATED },
    { mutationType: MutationType.Remove, payloadClassName: "TrustLineEventRemovePayload", event: TRUST_LINE_REMOVED },
    { mutationType: MutationType.Create, payloadClassName: "DataEntrySubscriptionPayload", event: DATA_ENTRY_CREATED },
    { mutationType: MutationType.Update, payloadClassName: "DataEntrySubscriptionPayload", event: DATA_ENTRY_UPDATED },
    { mutationType: MutationType.Remove, payloadClassName: "DataEntrySubscriptionPayload", event: DATA_ENTRY_REMOVED }
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
        if (m.mutationType === entry.mutationType && m.payloadClassName === payloadClassName) {
          console.log(payloadClassName);
          pubsub.publish(m.event, entry);
        }
      }
    }
  }
}
