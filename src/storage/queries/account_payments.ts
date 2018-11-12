import dig from "object-dig";
import { Asset } from "stellar-sdk";
import { IPaymentOperation } from "../../model";
import { Connection } from "../connection";
import { IPaymentOperationData } from "../types";
import { Query } from "./query";

export type IAccountPaymentsQueryResult = IPaymentOperation[];

export class AccountPaymentsQuery extends Query<IAccountPaymentsQueryResult> {
  private id: string;
  private first: number;
  private offset: number;

  constructor(connection: Connection, id: string, first: number, offset?: number) {
    super(connection);
    this.id = id;
    this.first = first;
    this.offset = offset || 0;
  }

  public async call(): Promise<IAccountPaymentsQueryResult> {
    const r = await this.request();
    const data = dig(r, "ops", 0, "operations");
    if (!data) {
      return [];
    }
    return data.map(this.mapData);
  }

  protected async request(): Promise<any> {
    return this.connection.query(
      `
        query accountOperations($id: string, $first: int, $offset: int) {
          ops(func: eq(type, "account")) @filter(eq(id, $id)) {
            operations(
              first: $first,
              offset: $offset,
              orderdesc: order
            ) @filter(eq(kind, "payment")) {
              account.source { id }
              account.destination { id }
              asset {
                code
                native
                issuer { id }
              }
              amount
              ledger { close_time }
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

  private mapData(dgraphData: IPaymentOperationData): IPaymentOperation {
    const assetData = dgraphData.asset[0];
    const asset = assetData.native ? Asset.native() : new Asset(assetData.code, assetData.issuer[0].id);

    return {
      destination: dgraphData["account.destination"][0].id,
      source: dgraphData["account.source"][0].id,
      amount: dgraphData.amount,
      asset: asset,
      dateTime: new Date(dgraphData.ledger[0].close_time)
    };
  }
}
