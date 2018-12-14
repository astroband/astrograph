import { ChangesExtractor, ChangeType, EntryType, IChange } from "../changes_extractor";
import {
  AccountSubscriptionPayload,
  DataEntrySubscriptionPayload,
  MutationType,
  NativeTrustLineSubscriptionPayload,
  OfferSubscriptionPayload,
  Transaction,
  TrustLineSubscriptionPayload
} from "../model";

export type SubscriptionPayload =
  | AccountSubscriptionPayload
  | TrustLineSubscriptionPayload
  | NativeTrustLineSubscriptionPayload
  | DataEntrySubscriptionPayload
  | OfferSubscriptionPayload;

// Collection of ledger changes loaded from transaction metas, contains data only from ledger.
export class SubscriptionPayloadCollection extends Array<SubscriptionPayload> {
  constructor(transactions: Transaction[]) {
    super();

    for (const tx of transactions) {
      const changesGroups = ChangesExtractor.call(tx);

      for (const changes of changesGroups) {
        for (const change of changes) {
          if (change.entry !== "account") {
            this.pushChanges(change);
            continue;
          }

          if (!change.accountChanges) {
            continue;
          }

          if (change.accountChanges.includes("balance")) {
            this.push(new NativeTrustLineSubscriptionPayload(MutationType.Update, change.data.account()));
          }

          // if there are some changes besides balance
          if (change.accountChanges.some(c => c !== "balance")) {
            this.pushChanges(change);
          }
        }
      }
    }
  }

  private pushChanges(change: IChange) {
    switch (change.type) {
      case ChangeType.Created:
        this.fetch(change, MutationType.Create);
        break;

      case ChangeType.Updated:
        this.fetch(change, MutationType.Update);
        break;

      case ChangeType.Removed:
        this.fetch(change, MutationType.Remove);
        break;
    }
  }

  private fetch(change: IChange, mutationType: MutationType) {
    switch (change.entry) {
      case EntryType.Account:
        this.push(new AccountSubscriptionPayload(mutationType, change.data.account()));
        break;
      case EntryType.Trustline:
        this.push(new TrustLineSubscriptionPayload(mutationType, change.data.trustLine()));
        break;
      case EntryType.Data:
        this.push(new DataEntrySubscriptionPayload(mutationType, change.data.data()));
        break;
      case EntryType.Offer:
        this.push(new OfferSubscriptionPayload(mutationType, change.data.offer()));
        break;
    }
  }
}
