import { Collection } from "./collection";

import {
  ACCOUNT_CREATED,
  ACCOUNT_REMOVED,
  ACCOUNT_UPDATED,
  LEDGER_CREATED,
  pubsub,
  TRUST_LINE_CREATED,
  TRUST_LINE_REMOVED,
  TRUST_LINE_UPDATED
} from "../pubsub";

import { EntryType, Ledger } from "../model";

export class Publisher {
  private static eventMap = [
    { entryType: EntryType.Create, payloadClassName: "AccountEntry", event: ACCOUNT_CREATED },
    { entryType: EntryType.Update, payloadClassName: "AccountEntry", event: ACCOUNT_UPDATED },
    { entryType: EntryType.Remove, payloadClassName: "AccountEntryKey", event: ACCOUNT_REMOVED },
    { entryType: EntryType.Create, payloadClassName: "TrustLineEntry", event: TRUST_LINE_CREATED },
    { entryType: EntryType.Update, payloadClassName: "TrustLineEntry", event: TRUST_LINE_UPDATED },
    { entryType: EntryType.Remove, payloadClassName: "TrustLineEntryKey", event: TRUST_LINE_REMOVED }
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
        if (m.entryType === entry.entryType && m.payloadClassName === payloadClassName) {
          pubsub.publish(m.event, entry);
        }
      }
    }
  }
}
