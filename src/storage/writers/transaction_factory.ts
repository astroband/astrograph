import { Transaction } from "../../model";
import { Connection } from "../connection";
import { TransactionWriter } from "./transaction_writer";
import { Writer } from "./writer";
import { WriterFactory } from "./writer_factory";

import * as nquads from "../nquads";

export interface IArgs {
  ledger: nquads.IValue;
}

export class TransactionFactory extends WriterFactory {
  public static async produce(connection: Connection, tx: Transaction, args: IArgs): Promise<Writer> {
    return new TransactionFactory(connection, tx, args).produce();
  }

  private tx: Transaction;
  private args: IArgs;

  constructor(connection: Connection, tx: Transaction, args: IArgs) {
    super(connection);
    this.tx = tx;
    this.args = args;
  }

  public async produce(): Promise<Writer> {
    const ledger = this.args.ledger;
    const context = await this.queryContext();

    const current = nquads.UID.from(context.current) || new nquads.Blank("transaction");
    const prev = nquads.UID.from(context.prev);

    return new TransactionWriter(this.connection, this.tx, { ledger, current, prev });
  }

  private queryContext(): Promise<any> {
    return this.connection.query(
      `
        query context($id: string, $ledger: string, $seq: string, $prevIndex: string) {
          prev(func: eq(type, "transaction")) @filter(eq(index, $prevIndex) AND eq(seq, $seq)) @cascade {
            uid
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
        $prevIndex: (this.tx.index - 1).toString(),
        $seq: this.tx.ledgerSeq.toString(),
        $id: this.tx.id
      }
    );
  }
}
