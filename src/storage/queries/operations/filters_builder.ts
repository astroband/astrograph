import { buildAssetFilter } from "../../../util/queries/asset_filter";
import { IAccountMergeQueryParams, IPaymentsQueryParams, ISetOptionsOpsQueryParams, OperationKinds } from "./types";

type Params = IPaymentsQueryParams | ISetOptionsOpsQueryParams;

export class FiltersBuilder {
  public static build(kind: OperationKinds, params: Params): { root: string; nested: string } {
    switch (kind) {
      case OperationKinds.Payment:
        return buildPaymentsFilters(params as IPaymentsQueryParams);
      case OperationKinds.SetOption:
        return buildSetOptionsFilters(params as ISetOptionsOpsQueryParams);
      case OperationKinds.AccountMerge:
        return buildAccountMergeFilters(params as IAccountMergeQueryParams);
    }
  }
}

function buildSetOptionsFilters(params: ISetOptionsOpsQueryParams) {
  const filters: string[] = [];

  if (params.masterWeight) {
    filters.push(`eq(masterWeight, ${params.masterWeight})`);
  }

  return {
    root: filters.length > 0 ? `@filter(${filters.join(" AND ")})` : "",
    nested: ""
  };
}

function buildPaymentsFilters(params: IPaymentsQueryParams) {
  return {
    root: "",
    nested: [
      params.asset ? buildAssetFilter(params.asset.code, params.asset.issuer) : "",
      params.destination ? `account.destination @filter(eq(id, "${params.destination}"))` : "",
      params.source ? `account.source @filter(eq(id, "${params.source}"))` : ""
    ].join("\n")
  };
}

function buildAccountMergeFilters(params: IAccountMergeQueryParams) {
  return {
    root: "",
    nested: params.destination ? `account.destination @filter(eq(id, "${params.destination}"))` : ""
  };
}
