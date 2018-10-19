import dig from "object-dig";
import { Memo } from "stellar-sdk";
import { ITransaction } from "../../model/transaction";
import { Connection } from "../connection";
import { ITransactionData } from "../types";
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
    return data.map(this.mapData);
  }

  protected async request(): Promise<any> {
    return this.connection.query(
      `
        query accountTransactions($id: string, $first: int, $offset: int) {
          txs(func: eq(type, "account")) @filter(eq(id, $id)) {
            transactions(
              first: $first,
              offset: $offset,
              orderdesc: seq,
              orderdesc: index
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

  private mapData(dgraphData: ITransactionData): ITransaction {
    let memo: Memo | null = null;

    if (dgraphData["memo.value"]) {
      memo = new Memo(dgraphData["memo.type"]!, dgraphData["memo.value"]!);
    }

    return {
      id: dgraphData.id,
      ledgerSeq: parseInt(dgraphData.seq, 10),
      index: parseInt(dgraphData.index, 10),
      // body
      memo,
      feeAmount: dgraphData.fee_amount,
      // result
      // meta
      // feeMeta
      sourceAccount: dgraphData["account.source"][0].id,
      timeBounds: [dgraphData["time_bounds.min"], dgraphData["time_bounds.max"]]
    };
  }
}
