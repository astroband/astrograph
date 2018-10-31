import dig from "object-dig";
import { Asset, IPaymentOperation } from "../../model";
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
    const asset = dgraphData.asset[0];
    return {
      destination: dgraphData["account.destination"][0].id,
      source: dgraphData["account.source"][0].id,
      amount: dgraphData.amount,
      asset: new Asset(asset.native, asset.code, asset.issuer[0].id)
    };
  }
}
