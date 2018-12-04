import dig from "object-dig";
import { Asset } from "stellar-sdk";
import { IPaymentOperation } from "../../model";
import { buildAssetFilter } from "../../util/queries/asset_filter";
import { Connection } from "../connection";
import { IPaymentOperationData } from "../types";
import { Query } from "./query";

export type IAccountPaymentsQueryResult = IPaymentOperation[];

interface IAssetParam {
  code: string;
  issuer?: string;
}

interface IAccountPaymentsQueryParams {
  id: string;
  asset: IAssetParam | null;
  destination: string | null;
}

export class AccountPaymentsQuery extends Query<IAccountPaymentsQueryResult> {
  private id: string;
  private destination: string | null;
  private asset: IAssetParam | null;
  private first: number;
  private offset: number;

  constructor(connection: Connection, params: IAccountPaymentsQueryParams, first: number, offset?: number) {
    super(connection);
    this.id = params.id;
    this.destination = params.destination;
    this.asset = params.asset;
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
    const query = `
      query accountOperations($id: string, $first: int, $offset: int) {
        A as var(func: eq(type, "operation")) @filter(eq(kind, "payment")) @cascade {
          ${this.asset ? buildAssetFilter(this.asset.code, this.asset.issuer) : ""}
          ${this.destinationFilter()}
        }

        ops(func: eq(type, "account")) @filter(eq(id, $id)) {
          operations(first: $first, offset: $offset, orderdesc: order) @filter(uid(A)) {
            account.source { id }
            account.destination { id }
            amount
            asset {
              native
              code
              issuer { id }
            }
            ledger { close_time }
          }
        }
      }
    `;

    return this.connection.query(query, {
      $id: this.id,
      $first: this.first.toString(),
      $offset: this.offset.toString()
    });
  }

  private destinationFilter() {
    if (!this.destination) {
      return "";
    }

    return `account.destination @filter(eq(id, "${this.destination}"))`;
  }

  private mapData(dgraphData: IPaymentOperationData): IPaymentOperation {
    const assetData = dgraphData.asset[0];
    const asset = assetData.native ? Asset.native() : new Asset(assetData.code, assetData.issuer[0].id);

    return {
      destination: dgraphData["account.destination"][0].id,
      source: dgraphData["account.source"][0].id,
      amount: dgraphData.amount,
      asset,
      dateTime: new Date(dgraphData.ledger[0].close_time)
    };
  }
}
