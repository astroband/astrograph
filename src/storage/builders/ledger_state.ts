import { Asset } from "stellar-sdk";
import { IChange } from "../../changes_extractor";
import { FakeNativeTrustLineValues, ITrustLine, Transaction, TrustLineValues } from "../../model";
import { Connection } from "../connection";
import { NQuad, NQuads } from "../nquads";
import { LastTrustLineEntryQuery } from "../queries/last_trust_line_entry";
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

    for (const change of this.changes) {
      switch (change.type) {
        case "created":
          builder = this.buildCreatedBuilder(change);
          break;
        case "updated":
          builder = await this.buildUpdatedBuilder(change);
          break;
        default:
          continue;
      }

      if (builder) {
        this.nquads.push(...builder.build());
        this.nquads.push(new NQuad(builder.current, "transaction", txBuilder.current));
      }
    }

    return this.nquads;
  }

  // returns builder for ingesting event of creating account or trustline
  private buildCreatedBuilder(change: any): TrustLineEntryBuilder | null {
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

    return new TrustLineEntryBuilder(data);
  }

  // returns builder for ingesting event of trustline update or account balance update
  private async buildUpdatedBuilder(change: any): Promise<TrustLineEntryBuilder | null> {
    let prevQuery: LastTrustLineEntryQuery;
    let data: ITrustLine;

    const c = new Connection();

    switch (change.entry) {
      case "account":
        if (change.accountChanges && !change.accountChanges.includes("balance")) {
          return null;
        }
        data = FakeNativeTrustLineValues.buildFromXDR(change.data.account());
        prevQuery = new LastTrustLineEntryQuery(c, Asset.native(), data.accountID);
        break;
      case "trustline":
        data = TrustLineValues.buildFromXDR(change.data.trustLine());
        prevQuery = new LastTrustLineEntryQuery(c, data.asset, data.accountID);
        break;
      default:
        return null;
    }

    const prev = await prevQuery.call();
    data.lastModified = change.seq;

    return new TrustLineEntryBuilder(data, prev);
  }
}
