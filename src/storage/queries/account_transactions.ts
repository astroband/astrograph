import dig from "object-dig";
import { ITransaction } from "../../model";
import { TransactionFactory } from "../../model/factories";
import { Connection } from "../connection";
import { Query } from "./query";

export type IAccountTransactionsQueryResult = ITransaction[];

export class AccountTransactionsQuery extends Query<IAccountTransactionsQueryResult> {
  private id: string;
  private first: number;
  private offset: number;

  constructor(connection: Connection, id: string, first: number, offset?: number) {
    super(connection);
    this.id = id;
    this.first = first;
    this.offset = offset || 0;
  }

  public async call(): Promise<IAccountTransactionsQueryResult> {
    const r = await this.request();
    const data = dig(r, "txs", 0, "transactions");
    return data.map(TransactionFactory.fromDgraph);
  }

  protected async request(): Promise<any> {
    return this.connection.query(
      `
        query accountTransactions($id: string, $first: int, $offset: int) {
          txs(func: has(account)) @filter(eq(id, $id)) {
            transactions(
              first: $first,
              offset: $offset,
              orderdesc: order
            ) {
              account.source { id }
              memo.value
              memo.type
              fee_amount
              seq
              order
              id
              index
            }
          }
        }
      `,
      {
        $id: this.id,
        $first: this.first.toString(),
        $offset: this.offset.toString()
      }
    );
  }
}
