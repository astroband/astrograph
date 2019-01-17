import logger from "../util/logger";
import { ChangesExtractor } from "../changes_extractor";
import { LedgerHeader, TransactionWithXDR } from "../model";
import { LedgerBuilder, LedgerStateBuilder, OperationBuilder, TransactionBuilder } from "./builders";
import { NQuads } from "./nquads";

export class Ingestor {
  public static async ingestLedgerState(header: LedgerHeader, transactions: TransactionWithXDR[]) {
    let nquads: NQuads = [];
    let builder: LedgerStateBuilder;

    for (const tx of transactions) {
      const changes = ChangesExtractor.call(tx);

      for (const group of changes) {
        builder = new LedgerStateBuilder(group, tx);
        nquads.push(...(await builder.build()));
      }
    }

    return nquads;
  }

  public static async ingestLedgerTransactions(header: LedgerHeader, transactions: TransactionWithXDR[]) {
    let nquads = new LedgerBuilder(header).build();

    for (const transaction of transactions) {
      nquads = nquads.concat(new TransactionBuilder(transaction).build());

      for (let index = 0; index < transaction.operationsXDR.length; index++) {
        try {
          nquads = nquads.concat(new OperationBuilder(transaction, index).build());
        } catch(err) {
          logger.log(
            "error",
            "Failed to ingest operation with XDR \"%s\" on transaction %s with result %s",
            transaction.operationsXDR[index].toXDR().toString("base64"),
            transaction.id,
            transaction.result
          );
          throw err;
        }
      }
    }

    return nquads;
  }
}
