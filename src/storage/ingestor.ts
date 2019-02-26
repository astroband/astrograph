import _ from "lodash";
import { ChangesExtractor } from "../changes_extractor";
import { LedgerHeader, TransactionWithXDR } from "../model";
import logger from "../util/logger";
import { LedgerBuilder, LedgerStateBuilder, OperationBuilder, TransactionBuilder } from "./builders";
import { NQuad, NQuads } from "./nquads";

export interface IIngestOpts {
  ingestOffers?: boolean;
}

const defaultOpts: IIngestOpts = { ingestOffers: false };

export class Ingestor {
  public static async ingestLedger(
    header: LedgerHeader,
    transactions: TransactionWithXDR[],
    opts: IIngestOpts = defaultOpts
  ) {
    opts = { ...defaultOpts, ...opts };
    const nquads: NQuads = new LedgerBuilder(header).build();
    let stateBuilder: LedgerStateBuilder;

    for (const tx of transactions) {
      const changes = ChangesExtractor.call(tx);
      nquads.push(...new TransactionBuilder(tx).build());

      for (const group of changes) {
        stateBuilder = new LedgerStateBuilder(group, tx, opts.ingestOffers);
        nquads.push(...(await stateBuilder.build()));
      }

      for (let index = 0; index < tx.operationsXDR.length; index++) {
        try {
          nquads.push(...new OperationBuilder(tx, index).build());
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

    // System thing, it allows us to find out later, how many ledgers are ingested indeed with
    // all transactions and operations, and not just created as a predicate for some other nodes
    nquads.push(new NQuad(LedgerBuilder.keyNQuad(header.ledgerSeq), "_ingested", NQuad.value(true)));

    return nquads;
  }
}
