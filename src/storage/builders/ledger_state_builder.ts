import stellar from "stellar-base";
import { TrustLineValues } from "../../model/trust_line_values";
import { NQuads } from "../nquads";
import { Builder } from "./builder";
import { TrustLineEntryBuilder } from "./trust_line_entry";

const changeType = stellar.xdr.LedgerEntryChangeType;
const ledgerEntryType = stellar.xdr.LedgerEntryType;

export class LedgerStateBuilder {
  private nquads: NQuads = [];

  constructor(private changes: any[]) {}

  public build(): NQuads {
    for (const change of this.changes) {
      switch (change.switch()) {
        case changeType.ledgerEntryCreated():
          this.pushCreated(change.created());
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
}
