import { LedgerStateParser } from "../../ledger_state_parser";
import { IAccount, IOffer, TransactionWithXDR } from "../../model";
import { NQuads } from "../nquads";
import { AccountBuilder, OfferBuilder } from "./";

export class LedgerStateBuilder {
  private nquads: NQuads = new NQuads();
  private readonly parser: LedgerStateParser;

  constructor(txs: TransactionWithXDR[], private readonly ingestOffers = false) {
    this.parser = new LedgerStateParser(txs);
  }

  public async build(): Promise<NQuads> {
    this.parser.parse();

    this.parser.updatedAccounts.forEach((data: IAccount) =>{
      const accountBuilder = new AccountBuilder(data);
      this.nquads.push(...accountBuilder.build());   
    });

    this.parser.createdAccounts.forEach((data: IAccount) =>{
      if (this.parser.updatedAccounts.has(data.id)) {
        return;
      }

      const accountBuilder = new AccountBuilder(data);
      this.nquads.push(...accountBuilder.build());   
    });

    if (!this.ingestOffers) {
      return this.nquads;
    }

    this.parser.updatedOffers.forEach((data: IOffer) =>{
      const offerBuilder = new OfferBuilder(data);
      this.nquads.push(...offerBuilder.build());   
    });

    this.parser.createdOffers.forEach((data: IOffer) =>{
      if (this.parser.updatedOffers.has(data.id)) {
        return;
      }

      const offerBuilder = new OfferBuilder(data);
      this.nquads.push(...offerBuilder.build());   
    });

    return this.nquads;
  }

  // public async buildOld(): Promise<NQuads> {
  //   if (this.changes.length === 0) {
  //     return this.nquads;
  //   }

  //   const txBuilder = new TransactionBuilder(this.tx);
  //   let builder: Builder | null;

  //   this.nquads.push(...txBuilder.build());

  //   this.changes.forEach((change, i) => {
  //     if (change.entry === EntryType.Offer && !this.ingestOffers) {
  //       return;
  //     }

  //     switch (change.type) {
  //       case ChangeType.Created:
  //         builder = this.buildCreatedBuilder(change, i);
  //         break;
  //       case ChangeType.Updated:
  //         builder = this.buildUpdatedBuilder(change, i);
  //         break;
  //       default:
  //         return;
  //     }

  //     if (builder) {
  //       this.nquads.push(...builder.build());
  //       this.nquads.push(new NQuad(builder.current, "transaction", txBuilder.current));
  //     }
  //   });

  //   return this.nquads;
  // }

  // private buildCreatedBuilder(change: any, n: number): Builder | null {
  //   let data: ITrustLineBase;

  //   switch (change.entry) {
  //     case EntryType.Account:
  //       data = TrustLineValuesFactory.fakeNativeFromXDR(change.data.account());
  //       break;
  //     case EntryType.Trustline:
  //       data = TrustLineValuesFactory.fromXDR(change.data.trustLine());
  //       break;
  //     case EntryType.Offer:
  //       return new OfferBuilder(change.data.offer(), change.seq);
  //     default:
  //       return null;
  //   }

  //   return new TrustLineEntryBuilder({ ...data, lastModified: change.seq }, change, n);
  // }

  // private buildUpdatedBuilder(change: any, n: number): Builder | null {
  //   let data: ITrustLineBase;

  //   switch (change.entry) {
  //     case EntryType.Account:
  //       if (change.accountChanges && !change.accountChanges.includes("balance")) {
  //         return null;
  //       }
  //       data = TrustLineValuesFactory.fakeNativeFromXDR(change.data.account());
  //       break;
  //     case EntryType.Trustline:
  //       data = TrustLineValuesFactory.fromXDR(change.data.trustLine());
  //       break;
  //     case EntryType.Offer:
  //       return new OfferBuilder(change.data.offer(), change.seq);
  //     default:
  //       return null;
  //   }

  //   return new TrustLineEntryBuilder({ ...data, lastModified: change.seq }, change, n);
  // }
}
