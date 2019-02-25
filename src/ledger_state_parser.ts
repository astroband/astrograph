import { ChangesExtractor, ChangeType, EntryType, IChange } from "./changes_extractor";
import { AccountID, IAccount, IOffer, TransactionWithXDR } from "./model";
import { AccountFactory, OfferFactory } from "./model/factories";
import { publicKeyFromXDR } from "./util/xdr/account";

export class LedgerStateParser {
  private readonly accounts: {
    created: Map<AccountID, IAccount>;
    updated: Map<AccountID, IAccount>;
    deleted: AccountID[];
  };

  private readonly offers: {
    created: Map<string, IOffer>;
    updated: Map<string, IOffer>;
    deleted: string[];
  };

  constructor(private readonly transactions: TransactionWithXDR[]) {
    this.offers = { created: new Map(), updated: new Map(), deleted: [] };
    this.accounts = { created: new Map(), updated: new Map(), deleted: [] };
  }

  public parse(): void {
    for (const tx of this.transactions) {
      const changes = ChangesExtractor.call(tx);

      for (const group of changes) {
        for (const change of group) {
          this.addChange(change);
        }
      }
    }
  }

  public get createdAccounts() {
    return this.accounts.created;
  }

  public get updatedAccounts() {
    return this.accounts.updated;
  }

  public get deletedAccountIds() {
    return this.accounts.deleted;
  }

  public get createdOffers() {
    return this.offers.created;
  }

  public get updatedOffers() {
    return this.offers.updated;
  }

  public get deletedOfferIds() {
    return this.offers.deleted;
  }

  private addChange(change: IChange): void {
    switch (change.entry) {
      case EntryType.Account:
        this.addAccountChange(change);
        break;
      case EntryType.Offer:
        this.addOfferChange(change);
        break;
    }
  }

  private addAccountChange(change: IChange): void {
    const xdrData = change.data.account();
    const accountId = publicKeyFromXDR(xdrData);

    if (change.type === ChangeType.Removed) {
      this.accounts.deleted.push(accountId);
      return;
    }

    if (accountId === "GA7YRWZP2X6HZZMX7A243QARVDFWJW3DZBS6G32A2H4LU3KKAM56ANQI" && change.type !== "state") {
      console.log(change.seq, change.tx.index, change.type);
    }
    const account = { lastModified: change.seq, ...AccountFactory.fromXDR(xdrData) };

    switch (change.type) {
      case ChangeType.Created:
        this.accounts.created.set(accountId, account);
        break;
      case ChangeType.Updated:
        this.accounts.updated.set(accountId, account);
        break;
    }
  }

  private addOfferChange(change: IChange): void {
    const offerId = change.data.offer().offerId().toString();

    if (change.type === ChangeType.Removed) {
      this.offers.deleted.push(offerId);
      return;
    }

    const xdrData = change.data.offer();
    const offer = { lastModified: change.seq, ...OfferFactory.fromXDR(xdrData) };

    switch (change.type) {
      case ChangeType.Created:
        this.offers.created.set(offerId, offer);
        break;
      case ChangeType.Updated:
        this.offers.updated.set(offerId, offer);
        break;
    }
  }
}
