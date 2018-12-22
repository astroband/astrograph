import _ from "lodash";
import { OperationKinds } from "../../../model2/operation";
import { buildAssetFilter } from "../../../util/queries/asset_filter";
import {
  IAccountMergeQueryParams,
  IAllowTrustQueryParams,
  IBumpSequenceQueryParams,
  IChangeTrustQueryParams,
  ICreateAccountQueryParams,
  IManageDataQueryParams,
  IManageOfferQueryParams,
  IPathPaymentsQueryParams,
  IPaymentsQueryParams,
  ISetOptionsOpsQueryParams
} from "../operations";

type Params =
  | IPaymentsQueryParams
  | ISetOptionsOpsQueryParams
  | IAccountMergeQueryParams
  | IAllowTrustQueryParams
  | IBumpSequenceQueryParams
  | IChangeTrustQueryParams
  | ICreateAccountQueryParams
  | IManageDataQueryParams
  | IManageOfferQueryParams
  | IPathPaymentsQueryParams;

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
      case OperationKinds.ChangeTrust:
        return buildChangeTrustFilters(params as IChangeTrustQueryParams);
      case OperationKinds.CreateAccount:
        return buildCreateAccountFilters(params as ICreateAccountQueryParams);
      case OperationKinds.ManageData:
        return buildManageDataFilters(params as IManageDataQueryParams);
      case OperationKinds.ManageOffer:
        return buildManageOfferFilters(params as IManageOfferQueryParams);
      case OperationKinds.PathPayment:
        return buildPathPaymentsFilters(params as IPathPaymentsQueryParams);
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

function buildChangeTrustFilters(params: IChangeTrustQueryParams) {
  return {
    root: params.limit ? `@filter(eq(limit, "${params.limit}"))` : "",
    nested: params.asset ? buildAssetFilter(params.asset.code, params.asset.issuer) : ""
  };
}

function buildCreateAccountFilters(params: ICreateAccountQueryParams) {
  return {
    root: "",
    nested: params.destination ? `account.destination @filter(eq(id, "${params.destination}"))` : ""
  };
}

function buildManageDataFilters(params: IManageDataQueryParams) {
  const filters: string[] = [];

  if (params.name) {
    filters.push(`eq(name, "${params.name}")`);
  }

  if (params.value) {
    filters.push(`eq(value, "${params.value}")`);
  } else if (params.value === null) {
    filters.push("NOT has(value)");
  }

  return {
    root: filters.length > 0 ? `@filter(${filters.join(" AND ")})` : "",
    nested: ""
  };
}

function buildManageOfferFilters(params: IManageOfferQueryParams) {
  return {
    root: params.offerId ? `@filter(eq(offer_id, "${params.offerId}"))` : "",
    nested: [
      params.assetBuying ? buildAssetFilter(params.assetBuying.code, params.assetBuying.issuer, "asset.buying") : "",
      params.assetSelling ? buildAssetFilter(params.assetSelling.code, params.assetSelling.issuer, "asset.selling") : ""
    ].join("\n")
  };
}

function buildPathPaymentsFilters(params: IPathPaymentsQueryParams) {
  return {
    root: "",
    nested: [
      params.destinationAsset
        ? buildAssetFilter(params.destinationAsset.code, params.destinationAsset.issuer, "asset.destination")
        : "",
      params.sourceAsset ? buildAssetFilter(params.sourceAsset.code, params.sourceAsset.issuer, "asset.source") : "",
      params.destinationAccount ? `account.destination @filter(eq(id, "${params.destinationAccount}"))` : "",
      params.sourceAccount ? `account.source @filter(eq(id, "${params.sourceAccount}"))` : "",
      params.pathContains ? buildAssetFilter(params.pathContains.code, params.pathContains.issuer, "assets.path") : ""
    ].join("\n")
  };
}
