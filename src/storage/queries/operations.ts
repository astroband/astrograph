import _ from "lodash";
import { Connection } from "../connection";
import { DgraphOperationsData } from "../types";
import { DataMapper } from "./operations/data_mapper";
import { FiltersBuilder } from "./operations/filters_builder";
import { queryPredicates } from "./operations/predicates";
import {
  IAccountMergeQueryParams,
  IAllowTrustQueryParams,
  IPaymentsQueryParams,
  ISetOptionsOpsQueryParams,
  Operation,
  OperationKinds
} from "./operations/types";
import { Query } from "./query";

interface IOperationsQueryParams {
  [OperationKinds.Payment]?: IPaymentsQueryParams;
  [OperationKinds.SetOption]?: ISetOptionsOpsQueryParams;
  [OperationKinds.AccountMerge]?: IAccountMergeQueryParams;
  [OperationKinds.AllowTrust]?: IAllowTrustQueryParams;
}

type IOperationsQueryResult = Operation[];

export class OperationsQuery extends Query<IOperationsQueryResult> {
  private offset: number;

  constructor(
    connection: Connection,
    private accountID: string,
    private filters: IOperationsQueryParams,
    private first: number,
    offset?: number
  ) {
    super(connection);
    this.offset = offset || 0;
  }

  public async call(): Promise<IOperationsQueryResult> {
    const r = await this.request();
    if (!r.ops) {
      return [];
    }
    return r.ops.map((op: DgraphOperationsData) => DataMapper.call(op));
  }

  protected async request(): Promise<any> {
    let query = "query operations($first: int, $offset: int) {";

    const opKinds = Object.keys(this.filters);

    opKinds.forEach(opKind => {
      const filters = FiltersBuilder.build(opKind as OperationKinds, this.filters[opKind]);

      query += `
        ${opKind} as var(func: eq(kind, "${opKind}"), orderdesc: order) ${filters.root} @cascade {
          ${filters.nested}
          ${this.accountID ? `account.source @filter(eq(id, ${this.accountID}))` : ""}
        }
      `;
    });

    query += `
        ops(func: uid(${opKinds.join()}), first: $first, offset: $offset, orderdesc: order) {
          kind
          index
          ledger { close_time }
          transaction { id }
          account.source { id }
          ${_
            .chain(opKinds)
            .map(opKind => queryPredicates[opKind])
            .flatten()
            .uniq()
            .value()
            .join("\n")}
        }
      }
    `;

    return this.connection.query(query, {
      $first: this.first.toString(),
      $offset: this.offset.toString()
    });
  }
}
