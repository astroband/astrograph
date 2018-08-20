import db from "../database";

import { Account, Ledger, TrustLine } from "../model";

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

import { AccountChange, Collection, TrustLineChange, Type as ChangeType } from "./changes";

export default class Publisher {
  public static async build(ledger: Ledger, collection: Collection): Promise<Publisher> {
    const accounts = await db.accounts.findAllMapByIDs(collection.accountIDs());
    const trustLines = await db.trustLines.findAllMapByAccountIDs(collection.trustLineAccountIDs());
    return new Publisher(collection, ledger, accounts, trustLines);
  }

  private collection: Collection;
  private accounts: Map<string, Account>;
  private trustLines: Map<string, TrustLine[]>;
  private ledger: Ledger;

  constructor(
    collection: Collection,
    ledger: Ledger,
    accounts: Map<string, Account>,
    trustLines: Map<string, TrustLine[]>
  ) {
    this.collection = collection;
    this.ledger = ledger;
    this.accounts = accounts;
    this.trustLines = trustLines;
  }

  public async publish() {
    pubsub.publish(LEDGER_CREATED, this.ledger);

    for (const change of this.collection) {
      // Here type checking order is important as AccountChange fits every other type
      if (change.kind === "Account") {
        switch (change.type) {
          case ChangeType.Create:
            this.publishAccountChange(ACCOUNT_CREATED, change);
            break;

          case ChangeType.Update:
            this.publishAccountChange(ACCOUNT_UPDATED, change);
            break;

          case ChangeType.Remove:
            this.publishAccountChange(ACCOUNT_REMOVED, change);
            break;
        }
      }

      if (change.kind === "TrustLine") {
        switch (change.type) {
          case ChangeType.Create:
            this.publishTrustLineChange(TRUST_LINE_CREATED, change);
            break;

          case ChangeType.Update:
            this.publishTrustLineChange(TRUST_LINE_UPDATED, change);
            break;

          case ChangeType.Remove:
            this.publishTrustLineChange(TRUST_LINE_REMOVED, change);
            break;
        }
      }
    }
  }

  private publishAccountChange(event: string, change: AccountChange) {
    pubsub.publish(event, this.accounts.get(change.accountID));
  }

  private publishTrustLineChange(event: string, change: TrustLineChange) {
    pubsub.publish(event, {
      accountID: change.accountID,
      trustLines: this.trustLines.get(change.accountID)
    });
  }
}
