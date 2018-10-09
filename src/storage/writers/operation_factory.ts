import { Connection } from "../connection";
import { OperationWriter } from "./operation_writer";
import { Writer } from "./writer";
import { WriterFactory } from "./writer_factory";

import * as nquads from "../nquads";

interface IArgs {
  ledger: nquads.IValue;
  tx: nquads.IValue;
  txIndex: number;
  seq: number;
}

export class OperationFactory extends WriterFactory {
  public static async produce(connection: Connection, xdr: any, index: number, args: IArgs): Promise<Writer> {
    return new OperationFactory(connection, xdr, index, args).produce();
  }

  private xdr: any;
  private index: number;
  private args: IArgs;

  constructor(connection: Connection, xdr: any, index: number, args: IArgs) {
    super(connection);

    this.xdr = xdr;
    this.index = index;
    this.args = args;
  }

  public async produce(): Promise<Writer> {
    const context = await this.queryContext();

    const current = nquads.UID.from(context.current) || new nquads.Blank("operation");
    const prev = nquads.UID.from(context.prev);

    const { ledger, tx, txIndex, seq } = this.args;

    return new OperationWriter(this.connection, this.xdr, this.index, {
      current,
      prev,
      ledger,
      tx,
      txIndex,
      seq
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
