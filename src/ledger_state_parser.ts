import { ChangesExtractor, ChangeType, EntryType, IChange } from "./changes_extractor";
import { TransactionWithXDR } from "./model";

export class LedgerStateParser {
  private readonly offers: {
    created: any[];
    updated: any[];
    deleted: number[];
  };

  constructor(private readonly transactions: TransactionWithXDR[]) {
    this.offers = { created: [], updated: [], deleted: [] };
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

  public get deletedOfferIds() {
    return this.offers.deleted;
  }

  private addChange(change: IChange): void {
    if (change.entry === EntryType.Offer) {
      this.addOfferChange(change);
    }
  }

  private addOfferChange(change: IChange): void {
    switch (change.type) {
      case ChangeType.Created:
        this.offers.created.push(change.data.offer());
        break;
      case ChangeType.Updated:
        this.offers.updated.push(change.data.offer());
        break;
      case ChangeType.Removed:
        this.offers.deleted.push(
          change.data
            .offer()
            .offerId()
            .toInt()
        );
        break;
    }
  }
}
