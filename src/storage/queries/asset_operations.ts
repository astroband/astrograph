import _ from "lodash";
import { Connection } from "../connection";
import { queryPredicates } from "./operations/predicates";

import { IAssetInput, Operation, OperationKinds } from "../../model";
import { OperationFactory } from "../../model/factories";

import { Query } from "./query";

type IAssetOperationsQueryResult = Operation[];

export class AssetOperationsQuery extends Query<IAssetOperationsQueryResult> {
  private offset: number;
  private kinds: OperationKinds[];

  constructor(
    connection: Connection,
    private asset: IAssetInput,
    kinds: OperationKinds[],
    private first: number,
    offset?: number
  ) {
    super(connection);
    this.offset = offset || 0;
    this.kinds = kinds || Object.keys(OperationKinds).map(k => OperationKinds[k]);
  }

  public async call(): Promise<IAssetOperationsQueryResult> {
    const r = await this.request();
    const ops = _.at(r, "issuer[0]['~asset.issuer'][0].operations");
    return (ops[0] || []).map(OperationFactory.fromDgraph);
  }

  protected async request(): Promise<any> {
    const opKindFilter = this.kinds.map(opKind => `has(kind.${opKind})`).join(" OR ");

    const query = `query assetOperations($code: string, $issuer: string, $first: int, $offset: int) {
      issuer(func: eq(account.id, $issuer)) {
        ~asset.issuer @filter(eq(code, $code))  {
          operations @filter(${opKindFilter}) (first: $first, offset: $offset, orderdesc: order) {
            kind
            index
            ledger { close_time }
            transaction { id }
            account.source { account.id }
            ${_
              .chain(this.kinds)
              .map(opKind => queryPredicates[opKind])
              .flatten()
              .uniq()
              .value()
              .join("\n")}
          }
        }
      }
    }`;

    return this.connection.query(query, {
      $issuer: this.asset.issuer,
      $code: this.asset.code,
      $first: this.first.toString(),
      $offset: this.offset.toString()
    });
  }
}
