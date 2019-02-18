import { ChangeType, EntryType, IChange } from "../../changes_extractor";
import { ITransaction, ITrustLineBase } from "../../model";
import { TrustLineValuesFactory } from "../../model/factories/trust_line_values_factory";
import { NQuad, NQuads } from "../nquads";
import { Builder, TransactionBuilder, TrustLineEntryBuilder } from "./";

export class LedgerStateBuilder {
  private nquads: NQuads = new NQuads();

  constructor(private changes: IChange[], private tx: ITransaction) {}

  public async build(): Promise<NQuads> {
    if (this.changes.length === 0) {
      return this.nquads;
    }

    const txBuilder = new TransactionBuilder(this.tx);
    let builder: Builder | null;

    this.nquads.push(...txBuilder.build());

    this.changes.forEach((change, i) => {
      switch (change.type) {
        case ChangeType.Created:
          builder = this.buildCreatedBuilder(change, i);
          break;
        case ChangeType.Updated:
          builder = this.buildUpdatedBuilder(change, i);
          break;
        default:
          return;
      }

      if (builder) {
        this.nquads.push(...builder.build());
        this.nquads.push(new NQuad(builder.current, "transaction", txBuilder.current));
      }
    });

    return this.nquads;
  }

  // returns builder for ingesting event of creating account or trustline
  private buildCreatedBuilder(change: any, n: number): TrustLineEntryBuilder | null {
    let data: ITrustLineBase;

    switch (change.entry) {
      case EntryType.Account:
        data = TrustLineValuesFactory.fakeNativeFromXDR(change.data.account());
        break;
      case EntryType.Trustline:
        data = TrustLineValuesFactory.fromXDR(change.data.trustLine());
        break;
      default:
        return null;
    }

    return new TrustLineEntryBuilder({ ...data, lastModified: change.seq }, change, n);
  }

  // returns builder for ingesting event of trustline update or account balance update
  private buildUpdatedBuilder(change: any, n: number): TrustLineEntryBuilder | null {
    let data: ITrustLineBase;

    switch (change.entry) {
      case EntryType.Account:
        if (change.accountChanges && !change.accountChanges.includes("balance")) {
          return null;
        }
        data = TrustLineValuesFactory.fakeNativeFromXDR(change.data.account());
        break;
      case EntryType.Trustline:
        data = TrustLineValuesFactory.fromXDR(change.data.trustLine());
        break;
      default:
        return null;
    }

    return new TrustLineEntryBuilder({ ...data, lastModified: change.seq }, change, n);
  }
}
