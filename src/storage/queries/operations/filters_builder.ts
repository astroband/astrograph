import _ from "lodash";
import { OperationKinds } from "../../../model/operation";
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
    let filters: { root: string[]; nested: string[] };

    switch (kind) {
      case OperationKinds.Payment:
        filters = buildPaymentsFilters(params as IPaymentsQueryParams);
        break;
      case OperationKinds.SetOption:
        filters = buildSetOptionsFilters(params as ISetOptionsOpsQueryParams);
        break;
      case OperationKinds.AccountMerge:
        filters = buildAccountMergeFilters(params as IAccountMergeQueryParams);
        break;
      case OperationKinds.AllowTrust:
        filters = buildAllowTrustFilters(params as IAllowTrustQueryParams);
        break;
      case OperationKinds.BumpSequence:
        filters = buildBumpSequenceFilters(params as IBumpSequenceQueryParams);
        break;
      case OperationKinds.ChangeTrust:
        filters = buildChangeTrustFilters(params as IChangeTrustQueryParams);
        break;
      case OperationKinds.CreateAccount:
        filters = buildCreateAccountFilters(params as ICreateAccountQueryParams);
        break;
      case OperationKinds.ManageData:
        filters = buildManageDataFilters(params as IManageDataQueryParams);
        break;
      case OperationKinds.ManageOffer:
        filters = buildManageOfferFilters(params as IManageOfferQueryParams);
        break;
      case OperationKinds.PathPayment:
        filters = buildPathPaymentsFilters(params as IPathPaymentsQueryParams);
        break;
      default:
        throw new Error(`Unknown operation kind "${kind}"`);
    }

    filters.root.push(`has(kind.${kind})`);

    return {
      root: `@filter(${filters.root.join("AND")})`,
      nested: filters.nested.join("\n")
    };
  }
}

function buildSetOptionsFilters(params: ISetOptionsOpsQueryParams) {
  const filters: string[] = [];

  if (params.masterWeight) {
    filters.push(`eq(masterWeight, ${params.masterWeight})`);
  }

  return { root: filters, nested: [] };
}

function buildPaymentsFilters(params: IPaymentsQueryParams) {
  return {
    root: [],
    nested: _.filter([
      params.asset && buildAssetFilter(params.asset.code, params.asset.issuer),
      params.destination && `account.destination @filter(eq(id, "${params.destination}"))`,
      params.source && `account.source @filter(eq(id, "${params.source}"))`
    ]) as string[]
  };
}

function buildAccountMergeFilters(params: IAccountMergeQueryParams) {
  return {
    root: [],
    nested: params.destination ? [`account.destination @filter(eq(id, "${params.destination}"))`] : []
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
    root: filters,
    nested: params.trustor ? [`trustor @filter(eq(id, "${params.trustor}"))`] : []
  };
}

function buildBumpSequenceFilters(params: IBumpSequenceQueryParams) {
  return {
    root: params.bumpTo ? [`eq(bump_to, ${params.bumpTo})`] : [],
    nested: []
  };
}

function buildChangeTrustFilters(params: IChangeTrustQueryParams) {
  return {
    root: params.limit ? [`eq(limit, "${params.limit}")`] : [],
    nested: params.asset ? [buildAssetFilter(params.asset.code, params.asset.issuer)] : []
  };
}

function buildCreateAccountFilters(params: ICreateAccountQueryParams) {
  return {
    root: [],
    nested: params.destination ? [`account.destination @filter(eq(id, "${params.destination}"))`] : []
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

  return { root: filters, nested: [] };
}

function buildManageOfferFilters(params: IManageOfferQueryParams) {
  return {
    root: params.offerId ? [`eq(offer_id, "${params.offerId}")`] : [],
    nested: _.filter([
      params.assetBuying && buildAssetFilter(params.assetBuying.code, params.assetBuying.issuer, "asset.buying"),
      params.assetSelling && buildAssetFilter(params.assetSelling.code, params.assetSelling.issuer, "asset.selling")
    ])
  };
}

function buildPathPaymentsFilters(params: IPathPaymentsQueryParams) {
  return {
    root: [],
    nested: _.filter([
      params.destinationAsset &&
        buildAssetFilter(params.destinationAsset.code, params.destinationAsset.issuer, "asset.destination"),
      params.sourceAsset && buildAssetFilter(params.sourceAsset.code, params.sourceAsset.issuer, "asset.source"),
      params.destinationAccount && `account.destination @filter(eq(id, "${params.destinationAccount}"))`,
      params.sourceAccount && `account.source @filter(eq(id, "${params.sourceAccount}"))`,
      params.pathContains && buildAssetFilter(params.pathContains.code, params.pathContains.issuer, "assets.path")
    ])
  };
}
