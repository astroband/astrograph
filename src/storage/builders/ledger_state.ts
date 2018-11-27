import { Asset } from "stellar-sdk";
import { FakeNativeTrustLineValues, ITrustLine, Transaction, TrustLineValues } from "../../model";
import { Connection } from "../connection";
import { NQuad, NQuads } from "../nquads";
import { LastTrustLineEntryQuery } from "../queries/last_trust_line_entry";
import { Builder } from "./builder";
import { TransactionBuilder } from "./transaction";
import { TrustLineEntryBuilder } from "./trust_line_entry";

export class LedgerStateBuilder {
  private nquads: NQuads = [];

  constructor(private changes: any[], private tx: Transaction) {}

  public async build(): Promise<NQuads> {
    const txBuilder = new TransactionBuilder(this.tx);
    let builder: Builder | null;

    for (const change of this.changes) {
      if (!change) {
        continue;
      }
      switch (change.type) {
        case "created":
          builder = this.pushCreated(change);
          break;
        case "updated":
          builder = await this.pushUpdated(change);
          break;
        default:
          continue;
      }

      if (builder) {
        this.nquads.push(...txBuilder.build());
        this.nquads.push(new NQuad(builder.current, "transaction", txBuilder.current));
      }
    }

    return this.nquads;
  }

  private pushCreated(change: any) {
    let builder: Builder;
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
    builder = new TrustLineEntryBuilder(data);

    this.nquads.push(...builder.build());

    return builder;
  }

  private async pushUpdated(change: any): Promise<Builder | null> {
    let builder: Builder;
    let prevQuery: LastTrustLineEntryQuery;
    let data: ITrustLine;

    const c = new Connection();

    switch (change.entry) {
      case "account":
        if (!change.accountChanges.includes("balance")) {
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
    builder = new TrustLineEntryBuilder(data, prev);

    this.nquads.push(...builder.build());

    return builder;
  }
}
