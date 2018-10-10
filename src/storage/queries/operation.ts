import { Transaction } from "../../model";
import { Connection } from "../connection";
import * as nquads from "../nquads";
import { Query } from "./query";

type IOperationQueryResult = {
  current: nquads.UID | null,
  prev: nquads.UID | null
}

export class OperationQuery extends Query<IOperationQueryResult> {
  private tx: Transaction;
  private index: number;

  constructor(connection: Connection, tx: Transaction, index: number) {
    super(connection);
    this.tx = tx;
    this.number = number;
  }

  protected async call(): Promise<any> {
    return this.connection.query(
      `
        query context($id: string, $prevIndex: int, $current: int) {
          prev(func: eq(type, "operation")) @filter(eq(index, $prevIndex)) @cascade {
            uid
            transaction @filter(eq(id, $id)) {
              uid
            }
          }

          current(func: eq(type, "operation")) @filter(eq(index, $current)) @cascade {
            uid
            transaction @filter(eq(id, $id)) {
              uid
            }
          }
        }
      `,
      {
        $id: this.args.tx.id,
        $prevIndex: (this.index - 1).toString(),
        $current: this.index.toString()
      }
    );
  }

  public async result(): Promise<IOperationQueryResult> {
    const r = await this.call();

    return {
      current: this.digUID(r, "current", 0, "uid"),
      prev: this.digUID(r, "prev", 0, "uid")
    };
  }
}
