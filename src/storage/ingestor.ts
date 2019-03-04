import { OperationIngestor } from "../ingest/operation";
import { LedgerHeader, TransactionWithXDR } from "../model";
import logger from "../util/logger";
import { LedgerStateBuilder } from "./builders";
import { NQuads } from "./nquads";

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

    const nquads = new NQuads();
    const stateBuilder = new LedgerStateBuilder(transactions, opts.ingestOffers);

    nquads.push(...stateBuilder.build());

    for (const tx of transactions) {
      for (let index = 0; index < tx.operationsXDR.length; index++) {
        try {
          nquads.push(...new OperationIngestor(tx, index).ingest());
        } catch (err) {
          logger.log(
            "error",
            'Failed to ingest operation with XDR "%s" on transaction %s with result %s',
            tx.operationsXDR[index].toXDR().toString("base64"),
            tx.id,
            tx.result
          );
          throw err;
        }
      }
    }

    return nquads;
  }
}
