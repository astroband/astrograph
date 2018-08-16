import db from "../database";

import { Account } from "../model";

import { ACCOUNT_CREATED, ACCOUNT_REMOVED, ACCOUNT_UPDATED, pubsub } from "../pubsub";
import { AccountChange, Collection, Type as ChangeType } from "./changes";

export default class Publisher {
  public static async build(collection: Collection): Promise<Publisher> {
    const accounts = await db.accounts.findAllMapByIDs(collection.accountIDs());
    return new Publisher(collection, accounts);
  }

  private collection: Collection;
  private accounts: Map<string, Account>;

  constructor(collection: Collection, accounts: Map<string, Account>) {
    this.collection = collection;
    this.accounts = accounts;
  }

  public async publish() {
    for (const change of this.collection) {
      // Here type checking order is important as AccountChange fits every other type
      if (change as AccountChange) {
        switch (change.type) {
          case ChangeType.Create:
            this.publishAccountEvent(ACCOUNT_CREATED, change);
            break;

          case ChangeType.Update:
            this.publishAccountEvent(ACCOUNT_UPDATED, change);
            break;

          case ChangeType.Remove:
            this.publishAccountEvent(ACCOUNT_REMOVED, change);
            break;
        }
      } // else if
    }
  }

  private publishAccountEvent(event: string, change: AccountChange) {
    pubsub.publish(event, this.accounts.get(change.accountID));
  }
}
