import { Transaction } from "../../model";
import { Connection } from "../connection";
import * as nquads from "../nquads";
import { Query } from "./query";

export interface IOperationQueryResult {
  current: nquads.UID | null;
  prev: nquads.UID | null;
  transaction: nquads.UID | null;
  ledger: nquads.UID | null;
}

export class OperationQuery extends Query<IOperationQueryResult> {
  private tx: Transaction;
  private index: number;

  constructor(connection: Connection, tx: Transaction, index: number) {
    super(connection);
    this.tx = tx;
    this.index = index;
  }

  public async call(): Promise<IOperationQueryResult> {
    const r = await this.request();

    return {
      current: this.digUID(r, "current", 0, "uid"),
      prev: this.digUID(r, "prev", 0, "uid"),
      transaction: this.digUID(r, "transaction", 0, "uid"),
      ledger: this.digUID(r, "ledger", 0, "uid")
    };
  }

  protected async request(): Promise<any> {
    return this.connection.query(
      `
        query context($id: string, $seq: string, $prevIndex: int, $current: int) {
          prev(func: eq(type, "operation"), first: 1) @filter(eq(index, $prevIndex)) @cascade {
            uid
            transaction @filter(eq(id, $id)) {
              uid
            }
          }

          current(func: eq(type, "operation"), first: 1) @filter(eq(index, $current)) @cascade {
            uid
            transaction @filter(eq(id, $id)) {
              uid
            }
          }

          transaction(func: eq(type, "transaction"), first: 1) @filter(eq(id, $id)) @cascade {
            uid
          }

          ledger(func: eq(type, "ledger"), first: 1) @filter(eq(seq, $seq)) {
            uid
          }
        }
      `,
      {
        $id: this.tx.id,
        $seq: this.tx.ledgerSeq.toString(),
        $prevIndex: (this.index - 1).toString(),
        $current: this.index.toString()
      }
    );
  }
}
