import { Transaction, TrustLineValues } from "../../model";
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

    switch (change.entry) {
      case "trustline":
        const data = TrustLineValues.buildFromXDR(change.data.trustLine());
        data.lastModified = change.seq;
        builder = new TrustLineEntryBuilder(data);

        this.nquads.push(...builder.build());
        break;
      default:
        return null;
    }

    return builder;
  }

  private async pushUpdated(change: any): Promise<Builder | null> {
    let builder: Builder;

    const c = new Connection();

    switch (change.entry) {
      case "trustline":
        const data = TrustLineValues.buildFromXDR(change.data.trustLine());
        const prevQuery = new LastTrustLineEntryQuery(c, data.asset, data.accountID);

        const prev = await prevQuery.call();
        data.lastModified = change.seq;
        builder = new TrustLineEntryBuilder(data, prev);

        this.nquads.push(...builder.build());
        break;
      default:
        return null;
    }

    return builder;
  }
}
