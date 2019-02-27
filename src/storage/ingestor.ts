import { LedgerHeader, TransactionWithXDR } from "../model";
import { LedgerStateBuilder } from "./builders";

export interface IIngestOpts {
  ingestOffers?: boolean;
}

const defaultOpts: IIngestOpts = { ingestOffers: false };

export class Ingestor {
  public static async ingestLedger(
    header: LedgerHeader, // @ts-ignore
    transactions: TransactionWithXDR[],
    opts: IIngestOpts = defaultOpts
  ) {
    opts = { ...defaultOpts, ...opts };
    const stateBuilder = new LedgerStateBuilder(transactions, opts.ingestOffers);
    return stateBuilder.build();
  }
}
