import { TransactionWithXDR } from "./model";
// import { TrustLineValues } from "./model/trust_line_values";
import { IChange, ChangeType, EntryType, ChangesExtractor } from "./changes_extractor";

export class LedgerStateParser {
  private offers: {
    created: any[];
    updated: any[];
    deleted: number[];
  }

  // private trustLineValues: {
  //   created: TrustLineValues[];
  //   updated: TrustLineValues[];
  // }

  constructor(private transactions: TransactionWithXDR[]) {
    this.offers = { created: [], updated: [], deleted: [] };
    // this.trustLineValues = { created: [], updated: [] };
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

  public addChange(change: IChange): void {
    switch (change.entry) {
      case EntryType.Offer:
        this.addOfferChange(change);
        break;
      // case EntryType.Account:
      // case EntryType.Trustline:
      //   this.addBalanceChange(change);
      //   break;
    }
  }

  // private addBalanceChange(change: IChange): void {
  //   switch (change.type) {
  //     case ChangeType.Created:
  //       this.offers.created.push(change.data.offer()) 
  //       break;
  //     case ChangeType.Updated:
  //       this.offers.updated.push(change.data.offer()) 
  //       break;
  //     case ChangeType.Removed:
  //       this.offers.deleted.push(change.data.offer().offerId().toInt()) 
  //       break;
  //   }
  // }

  private addOfferChange(change: IChange): void {
    switch (change.type) {
      case ChangeType.Created:
        this.offers.created.push(change.data.offer()) 
        break;
      case ChangeType.Updated:
        this.offers.updated.push(change.data.offer()) 
        break;
      case ChangeType.Removed:
        console.log(change.data.offer().offerId().toInt());
        this.offers.deleted.push(change.data.offer().offerId().toInt()) 
        break;
    }
  }

  public get deletedOfferIds() {
    return this.offers.deleted;
  }
}
