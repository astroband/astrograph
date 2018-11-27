import stellar from "stellar-base";
import { Transaction, TrustLineValues } from "../../model";
import { Connection } from "../connection";
import { NQuad, NQuads } from "../nquads";
import { LastTrustLineEntryQuery } from "../queries/last_trust_line_entry";
import { Builder } from "./builder";
import { TransactionBuilder } from "./transaction";
import { TrustLineEntryBuilder } from "./trust_line_entry";

const changeType = stellar.xdr.LedgerEntryChangeType;
const ledgerEntryType = stellar.xdr.LedgerEntryType;

export class LedgerStateBuilder {
  private nquads: NQuads = [];

  constructor(private changes: any[], private tx: Transaction) {}

  public async build(): Promise<NQuads> {
    const txBuilder = new TransactionBuilder(this.tx);
    let builder: Builder | null;

    for (const change of this.changes) {
      switch (change.switch()) {
        case changeType.ledgerEntryCreated():
          builder = this.pushCreated(change.created());
          break;
        case changeType.ledgerEntryUpdated():
          builder = await this.pushUpdated(change.updated());
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

  private pushCreated(xdr: any) {
    let builder: Builder;

    switch (xdr.data().switch()) {
      case ledgerEntryType.trustline():
        const data = TrustLineValues.buildFromXDR(xdr.data().trustLine());
        data.lastModified = xdr.lastModifiedLedgerSeq();
        builder = new TrustLineEntryBuilder(data);

        this.nquads.push(...builder.build());
        break;
      default:
        return null;
    }

    return builder;
  }

  private async pushUpdated(xdr: any): Promise<Builder | null> {
    let builder: Builder;

    const c = new Connection();

    switch (xdr.data().switch()) {
      case ledgerEntryType.trustline():
        const data = TrustLineValues.buildFromXDR(xdr.data().trustLine());
        const prevQuery = new LastTrustLineEntryQuery(c, data.asset, data.accountID);

        const prev = await prevQuery.call();
        data.lastModified = xdr.lastModifiedLedgerSeq();
        builder = new TrustLineEntryBuilder(data, prev);

        this.nquads.push(...builder.build());
        break;
      default:
        return null;
    }

    return builder;
  }
}
