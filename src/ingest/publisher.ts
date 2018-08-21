import {
  // AccountEntry,
  // AccountEntryKey,
  EntryType,
  IEntryType,
  Ledger,
  // TrustLineEntry,
  // TrustLineEntryKey
} from "../model";

import {
  // ACCOUNT_CREATED,
  // ACCOUNT_REMOVED,
  // ACCOUNT_UPDATED,
  LEDGER_CREATED,
  pubsub,
  // TRUST_LINE_CREATED,
  // TRUST_LINE_REMOVED,
  // TRUST_LINE_UPDATED
} from "../pubsub";

import { Collection } from "./collection";

export class Publisher {
  private ledger: Ledger;
  private collection: Collection;

  constructor(
    ledger: Ledger,
    collection: Collection
  ) {
    this.ledger = ledger;
    this.collection = collection;
  }

  public async publish() {
    pubsub.publish(LEDGER_CREATED, this.ledger);

    for (const entry of this.collection) {
      switch ((entry as IEntryType).entryType) {
        case EntryType.Create:
          console.log(entry.constructor.name);
          break;

        case EntryType.Update:
          console.log(entry.constructor.name);
        break;

        case EntryType.Remove:
          console.log(entry.constructor.name);
          break;
      }

    //   // Here type checking order is important as AccountChange fits every other type
    //   if (change instanceof "Account") {
    //     switch (change.type) {
    //       case ChangeType.Create:
    //         this.publishAccountChange(ACCOUNT_CREATED, change);
    //         break;
    //
    //       case ChangeType.Update:
    //         this.publishAccountChange(ACCOUNT_UPDATED, change);
    //         break;
    //
    //       case ChangeType.Remove:
    //         this.publishAccountChange(ACCOUNT_REMOVED, change);
    //         break;
    //     }
    //   }
    //
    //   if (change.kind === "TrustLine") {
    //     switch (change.type) {
    //       case ChangeType.Create:
    //         this.publishTrustLineChange(TRUST_LINE_CREATED, change);
    //         break;
    //
    //       case ChangeType.Update:
    //         this.publishTrustLineChange(TRUST_LINE_UPDATED, change);
    //         break;
    //
    //       case ChangeType.Remove:
    //         this.publishTrustLineChange(TRUST_LINE_REMOVED, change);
    //         break;
    //     }
    //   }
    }
  }

  // private publishAccountChange(event: string, change: AccountChange) {
  //   pubsub.publish(event, this.accounts.get(change.accountID));
  // }
  //
  // private publishTrustLineChange(event: string, change: TrustLineChange) {
  //   pubsub.publish(event, {
  //     accountID: change.accountID,
  //     trustLines: this.trustLines.get(change.accountID)
  //   });
  // }
}
