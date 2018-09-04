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

import { Ledger, PayloadType } from "../model";

export class Publisher {
  private static eventMap = [
    { payloadType: PayloadType.Create, payloadClassName: "AccountEventPayload", event: ACCOUNT_CREATED },
    { payloadType: PayloadType.Update, payloadClassName: "AccountEventPayload", event: ACCOUNT_UPDATED },
    { payloadType: PayloadType.Remove, payloadClassName: "AccountEventRemovePayload", event: ACCOUNT_REMOVED },
    { payloadType: PayloadType.Create, payloadClassName: "TrustLineEventPayload", event: TRUST_LINE_CREATED },
    { payloadType: PayloadType.Update, payloadClassName: "TrustLineEventPayload", event: TRUST_LINE_UPDATED },
    { payloadType: PayloadType.Remove, payloadClassName: "TrustLineEventRemovePayload", event: TRUST_LINE_REMOVED },
    { payloadType: PayloadType.Create, payloadClassName: "DataEntryEventPayload", event: DATA_ENTRY_CREATED },
    { payloadType: PayloadType.Update, payloadClassName: "DataEntryEventPayload", event: DATA_ENTRY_UPDATED },
    { payloadType: PayloadType.Remove, payloadClassName: "DataEntryEventRemovePayload", event: DATA_ENTRY_REMOVED }
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
        if (m.payloadType === entry.payloadType && m.payloadClassName === payloadClassName) {
          pubsub.publish(m.event, entry);
        }
      }
    }
  }
}
