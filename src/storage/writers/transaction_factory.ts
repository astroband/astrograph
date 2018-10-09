import { Transaction } from "../../model";
import { Connection } from "../connection";
import { WriterFactory } from "./writer_factory";
import { TransactionWriter } from "./transaction_writer";
import { Writer } from "./writer";
import { RecurseIterator } from "../recurse_iterator";

import * as nquads from "../nquads";

export interface IArgs {
  ledger: nquads.IValue;
}

export class TransactionFactory extends WriterFactory {
  private tx: Transaction;
  private args: IArgs;

  public static async produce(connection: Connection, tx: Transaction, args: IArgs): Promise<Writer> {
    return new TransactionFactory(connection, tx, args).produce();
  }

  constructor(connection: Connection, tx: Transaction, args: IArgs) {
    super(connection);
    this.tx = tx;
    this.args = args;
  }

  public async produce(): Promise<Writer> {
    const ledger = this.args.ledger;
    const context = await this.queryContext();

    const current = nquads.UID.from(context.current) || new nquads.Blank("transaction");

    const prevTransaction = this.findPrevTransaction(context.prevTree[0]);
    const prev = nquads.UID.from(prevTransaction);

    return new TransactionWriter(this.connection, this.tx, { ledger, current, prev });
  }

  // Returns prev transactions within ledger.
  //
  // We assume that all ledgers are ingested in full, including all underlying transactions, operations
  // and all other entities.
  //
  // prevTree finds previous lastest transaction within linked list of ledgers and ensures the chain is
  // consistent. For example, if you have ingested ledgers 100-200 and then decide to ingest ledgers 500-600,
  // first transaction from ledger 500 should have blank previous transaction because it is missing in database.
  //
  // `depth` sets the maximum number of ledgers in row containing zero transactions.
  private queryContext(): Promise<any> {
    return this.connection.query(
      `
        query context($id: string, $ledger: string) {
          prevTree(func: uid($ledger), orderdesc: seq) @recurse(depth: 20, loop: true) {
            uid
            index
            seq

            transactions(orderdesc: index) {
              uid
              index
            }

            prev
          }

          current(func: eq(type, "transaction"), first: 1) @filter(eq(id, $id)) {
            uid
            memo {
              uid
            }
          }
        }
      `,
      {
        $ledger: this.args.ledger.raw,
        $id: this.tx.id
      }
    );
  }

  private findPrevTransaction(prevTree: any) {
    const match = (tx: any) => {
      const sameLedger = tx.seq === this.tx.ledgerSeq;
      const prevIndex = tx.index === this.tx.index - 1;

      return (sameLedger && prevIndex) || !sameLedger;
    };

    return new RecurseIterator(prevTree, "prev", "transactions").find((txs: any) => txs.find(match));
  }
}
