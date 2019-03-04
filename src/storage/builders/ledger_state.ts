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

  public build(): NQuads {
    this.parser.parse();

    this.parser.updatedAccounts.forEach((data: IAccount) => {
      const accountBuilder = new AccountBuilder(data);
      this.nquads.push(...accountBuilder.build());
    });

    this.parser.createdAccounts.forEach((data: IAccount) => {
      if (this.parser.updatedAccounts.has(data.id)) {
        return;
      }

      const accountBuilder = new AccountBuilder(data);
      this.nquads.push(...accountBuilder.build());
    });

    if (!this.ingestOffers) {
      return this.nquads;
    }

    this.parser.updatedOffers.forEach((data: IOffer) => {
      const offerBuilder = new OfferBuilder(data);
      this.nquads.push(...offerBuilder.build());
    });

    this.parser.createdOffers.forEach((data: IOffer) => {
      if (this.parser.updatedOffers.has(data.id)) {
        return;
      }

      const offerBuilder = new OfferBuilder(data);
      this.nquads.push(...offerBuilder.build());
    });

    return this.nquads;
  }
}
