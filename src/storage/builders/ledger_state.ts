import stellar from "stellar-base";
import { TrustLineValues } from "../../model/trust_line_values";
import { Connection } from "../connection";
import { NQuads } from "../nquads";
import { LastTrustLineEntryQuery } from "../queries/last_trust_line_entry";
import { Builder } from "./builder";
import { TrustLineEntryBuilder } from "./trust_line_entry";

const changeType = stellar.xdr.LedgerEntryChangeType;
const ledgerEntryType = stellar.xdr.LedgerEntryType;

export class LedgerStateBuilder {
  private nquads: NQuads = [];

  constructor(private changes: any[]) {}

  public async build(): Promise<NQuads> {
    for (const change of this.changes) {
      switch (change.switch()) {
        case changeType.ledgerEntryCreated():
          this.pushCreated(change.created());
          break;
        case changeType.ledgerEntryUpdated():
          await this.pushUpdated(change.updated());
          break;
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
    }
  }

  private async pushUpdated(xdr: any) {
    let builder: Builder;

    const c = new Connection();

    switch (xdr.data().switch()) {
      case ledgerEntryType.trustline():
        const data = TrustLineValues.buildFromXDR(xdr.data().trustLine());
        const prevQuery = new LastTrustLineEntryQuery(c, data.asset, data.accountID);

        const prev = await prevQuery.call();
        data.lastModified = xdr.lastModifiedLedgerSeq();
        builder = new TrustLineEntryBuilder(data, prev as string);

        this.nquads.push(...builder.build());
        break;
    }
  }
}
