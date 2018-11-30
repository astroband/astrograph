import { IChange } from "../../changes_extractor";
import { FakeNativeTrustLineValues, ITrustLine, Transaction, TrustLineValues } from "../../model";
import { NQuad, NQuads } from "../nquads";
import { Builder } from "./builder";
import { TransactionBuilder } from "./transaction";
import { TrustLineEntryBuilder } from "./trust_line_entry";

export class LedgerStateBuilder {
  private nquads: NQuads = [];

  constructor(private changes: IChange[], private tx: Transaction) {}

  public async build(): Promise<NQuads> {
    if (this.changes.length === 0) {
      return [];
    }

    const txBuilder = new TransactionBuilder(this.tx);
    let builder: Builder | null;

    this.nquads.push(...txBuilder.build());

    this.changes.forEach((change, i) => {
      switch (change.type) {
        case "created":
          builder = this.buildCreatedBuilder(change, i);
          break;
        case "updated":
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
    let data: ITrustLine;

    switch (change.entry) {
      case "account":
        data = FakeNativeTrustLineValues.buildFromXDR(change.data.account());
        break;
      case "trustline":
        data = TrustLineValues.buildFromXDR(change.data.trustLine());
        break;
      default:
        return null;
    }

    data.lastModified = change.seq;

    return new TrustLineEntryBuilder(data, change, n);
  }

  // returns builder for ingesting event of trustline update or account balance update
  private buildUpdatedBuilder(change: any, n: number): TrustLineEntryBuilder | null {
    let data: ITrustLine;

    switch (change.entry) {
      case "account":
        if (change.accountChanges && !change.accountChanges.includes("balance")) {
          return null;
        }
        data = FakeNativeTrustLineValues.buildFromXDR(change.data.account());
        break;
      case "trustline":
        data = TrustLineValues.buildFromXDR(change.data.trustLine());
        break;
      default:
        return null;
    }

    data.lastModified = change.seq;

    return new TrustLineEntryBuilder(data, change, n);
  }
}
