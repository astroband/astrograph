import _ from "lodash";
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
    const data = _.at(r, "account[0]['~tx.source']");

    return (data[0] || []).map(TransactionFactory.fromDgraph);
  }

  protected async request(): Promise<any> {
    return this.connection.query(
      `
        query accountTransactions($id: string, $first: int, $offset: int) {
          account(func: eq(account.id, $id)) {
            ~tx.source(
              first: $first,
              offset: $offset,
              orderdesc: order
            ) {
              tx.id
              tx.index
              tx.ledger { ledger.id }
              tx.source { account.id }
              memo.value
              memo.type
              fee_amount
              order
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
