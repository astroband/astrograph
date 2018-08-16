import db from "../database";

import { ACCOUNT_CREATED, ACCOUNT_REMOVED, ACCOUNT_UPDATED, pubsub } from "../pubsub";
import { AccountChange, Collection, Type as ChangeType } from "./changes";

export default class Publisher {
  private collection: Collection;

  constructor(collection: Collection) {
    this.collection = collection;
  }

  public async publish() {
    const accounts = await this.loadAccounts();

    for (const change of this.collection) {
      if (change as AccountChange) {
        switch (change.type) {
          case ChangeType.Create:
            pubsub.publish(ACCOUNT_CREATED, accounts[change.accountID]);
            break;

          case ChangeType.Update:
            pubsub.publish(ACCOUNT_UPDATED, accounts[change.accountID]);
            break;

          case ChangeType.Remove:
            pubsub.publish(ACCOUNT_REMOVED, accounts[change.accountID]);
            break;
        }
      } // else if
    }
  }

  private loadAccounts() {
    return db.accounts.findAllMapByIDs(this.collection.accountIDs());
  }
}
