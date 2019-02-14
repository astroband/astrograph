// This module holds definitions of data types for "raw" objects,
// which are returned from Dgraph storage
import { AccountID } from "../model/account_id";
import { AssetCode } from "../model/asset_code";
import { OperationKinds } from "../model/operation";
import { MemoType } from "../util/stellar";

export interface ITransactionData {
  id: string;
  seq: string;
  index: string;
  // body
  "memo.value": string | null;
  "memo.type": MemoType | null;
  fee_amount: string;
  fee_charged: string;
  success: boolean;
  result_code: number;
  // result
  // meta
  // feeMeta
  "account.source": IAccountData[];
  // Datetime ISO string
  "time_bounds.min": string;
  "time_bounds.max": string;
}

interface IOperationData {
  kind: OperationKinds;
  ledger: ILedgerData[];
  index: string;
  transaction: ITransactionData[];
}

export interface IPaymentOperationData extends IOperationData {
  "account.source": IAccountData[];
  "account.destination": IAccountData[];
  amount: string;
  asset: IAssetData[];
}

export interface ISetOptionsOperationData extends IOperationData {
  master_weight: string;
  home_domain: string;
  clear_flags: string;
  set_flags: string;
  thresholds: {
    high: string;
    med: string;
    low: string;
  };
  "account.inflation_dest": IAccountData[];
  signer: {
    account: IAccountData[];
    weight: string;
  };
}

export interface IAccountMergeOperationData extends IOperationData {
  "account.destination": IAccountData[];
}

export interface IAllowTrustOperationData extends IOperationData {
  trustor: IAccountData[];
  asset_code: AssetCode;
  authorize: boolean;
}

export interface IBumpSequenceOperationData extends IOperationData {
  bump_to: number;
}

export interface IChangeTrustOperationData extends IOperationData {
  limit: string;
  asset: IAssetData[];
}

export interface ICreateAccountOperationData extends IOperationData {
  starting_balance: string;
  "account.destination": IAccountData[];
}
export interface IManageDataOperationData extends IOperationData {
  name: string;
  value: string;
}

export interface IManageOfferOperationData extends IOperationData {
  price_n: string;
  price_d: string;
  price: number;
  offer_id: string;
  "asset.selling": IAssetData[];
  "asset.buying": IAssetData[];
  amount: number;
}

export interface IPathPaymentOperationData extends IOperationData {
  send_max: string;
  dest_amount: string;
  "account.destination": IAccountData[];
  "asset.destination": IAssetData[];
  "asset.source": IAssetData[];
  "assets.path": IAssetData[];
}

export type DgraphOperationsData = IPaymentOperationData &
  ISetOptionsOperationData &
  IAccountMergeOperationData &
  IAllowTrustOperationData &
  IBumpSequenceOperationData &
  IChangeTrustOperationData &
  ICreateAccountOperationData &
  IManageDataOperationData &
  IManageOfferOperationData &
  IPathPaymentOperationData;

export interface IAssetData {
  code: AssetCode;
  issuer: IAccountData[];
  native: boolean;
}

export interface IAccountData {
  id: AccountID;
  // it's incomplete
}

export interface ILedgerData {
  close_time: string;
}
