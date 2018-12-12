import { buildAssetFilter } from "../../../util/queries/asset_filter";
import {
  IAccountMergeQueryParams,
  IAllowTrustQueryParams,
  IPaymentsQueryParams,
  ISetOptionsOpsQueryParams,
  OperationKinds,
  IBumpSequenceQueryParams
} from "./types";

type Params = IPaymentsQueryParams | ISetOptionsOpsQueryParams | IAccountMergeQueryParams | IAllowTrustQueryParams | IBumpSequenceQueryParams;

export class FiltersBuilder {
  public static build(kind: OperationKinds, params: Params): { root: string; nested: string } {
    switch (kind) {
      case OperationKinds.Payment:
        return buildPaymentsFilters(params as IPaymentsQueryParams);
      case OperationKinds.SetOption:
        return buildSetOptionsFilters(params as ISetOptionsOpsQueryParams);
      case OperationKinds.AccountMerge:
        return buildAccountMergeFilters(params as IAccountMergeQueryParams);
      case OperationKinds.AllowTrust:
        return buildAllowTrustFilters(params as IAllowTrustQueryParams);
      case OperationKinds.BumpSequence:
        return buildBumpSequenceFilters(params as IBumpSequenceQueryParams);
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

function buildAllowTrustFilters(params: IAllowTrustQueryParams) {
  const filters: string[] = [];

  if (params.authorize) {
    filters.push(`eq(authorize, ${params.authorize})`);
  }

  if (params.assetCode) {
    filters.push(`eq(asset_code, ${params.assetCode})`);
  }

  return {
    root: filters.length > 0 ? `@filter(${filters.join(" AND ")})` : "",
    nested: params.trustor ? `trustor @filter(eq(id, "${params.trustor}"))` : ""
  };
}

function buildBumpSequenceFilters(params: IBumpSequenceQueryParams) {
  return {
    root: params.bumpTo ? `@filter(eq(bump_to, ${params.bumpTo}))` : "",
    nested: ""
  };
}
