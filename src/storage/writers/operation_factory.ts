import { Transaction } from "../../model";
import { Connection } from "../connection";
import { OperationWriter } from "./operation_writer";
import { Writer } from "./writer";
import { WriterFactory } from "./writer_factory";

import dig from "object-dig";

import * as nquads from "../nquads";

interface IArgs {
  ledger: nquads.Value;
  tx: nquads.Value;
}

export class OperationFactory extends WriterFactory {
  public static async produce(connection: Connection, tx: Transaction, index: number, args: IArgs): Promise<Writer> {
    return new OperationFactory(connection, tx, index, args).produce();
  }

  private tx: Transaction;
  private index: number;
  private args: IArgs;

  constructor(connection: Connection, tx: Transaction, index: number, args: IArgs) {
    super(connection);

    this.tx = tx;
    this.index = index;
    this.args = args;
  }

  public async produce(): Promise<Writer> {
    const context = await this.queryContext();

    const current = nquads.UID.from(dig(context.current, "0", "uid")) || new nquads.Blank("operation");
    const prev = nquads.UID.from(dig(context.prev, "0", "uid"));

    const { ledger, tx } = this.args;

    return new OperationWriter(this.connection, this.tx, this.index, {
      current,
      prev,
      ledger,
      tx
    });
  }

  private queryContext(): Promise<any> {
    return this.connection.query(
      `
        query context($id: string, $prevIndex: int, $current: int) {
          prev(func: eq(type, "operation")) @filter(eq(index, $prevIndex)) @cascade {
            uid
            transaction @filter(uid($id)) {
              uid
            }
          }

          current(func: eq(type, "operation")) @filter(eq(index, $current)) @cascade {
            uid
            transaction @filter(uid($id)) {
              uid
            }
          }
        }
      `,
      {
        $id: (this.args.tx as nquads.UID).raw,
        $prevIndex: (this.index - 1).toString(),
        $current: this.index.toString()
      }
    );
  }
}
