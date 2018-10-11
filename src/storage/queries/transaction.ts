import { Transaction } from "../../model";
import { Connection } from "../connection";
import * as nquads from "../nquads";
import { Query } from "./query";

export interface ITransactionQueryResult {
  current: nquads.UID | null;
  prev: nquads.UID | null;
  memo: nquads.UID | null;
  ledger: nquads.UID | null;
}

export class TransactionQuery extends Query<ITransactionQueryResult> {
  private tx: Transaction;

  constructor(connection: Connection, tx: Transaction) {
    super(connection);
    this.tx = tx;
  }

  public async call(): Promise<ITransactionQueryResult> {
    const r = await this.request();

    return {
      current: this.digUID(r, "current", 0, "uid"),
      memo: this.digUID(r, "current", 0, "memo", 0, "uid"),
      prev: this.digUID(r, "prev", 0, "uid"),
      ledger: this.digUID(r, "ledger", 0, "uid")
    };
  }

  protected async request(): Promise<any> {
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

          ledger(func: eq(type, "ledger"), first: 1) @filter(eq(seq, $seq)) {
            uid
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
