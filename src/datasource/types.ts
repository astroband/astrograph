import { MemoHash, MemoID, MemoNone, MemoReturn, MemoText } from "stellar-sdk";
import { AccountID } from "../model/account_id";
import { AssetCode } from "../model/asset_code";

type HorizonAssetType = "native" | "alphanum4" | "alphanum12";
export type HorizonOpType =
  | "create_account"
  | "payment"
  | "path_payment"
  | "manage_offer"
  | "set_options"
  | "change_trust"
  | "allow_trust"
  | "account_merge"
  | "manage_data"
  | "bump_sequence";

interface IBaseOperationData {
  id: string;
  paging_token: any;
  source_account: AccountID;
  transaction_hash: string;
  created_at: string;
  type: HorizonOpType;
  type_i: number;
}

export interface ICreateAccountOperationData {
  account: string;
  funder: string;
  starting_balance: string;
}

export interface IPaymentOperationData extends IBaseOperationData {
  from: AccountID;
  to: AccountID;
  asset_type: HorizonAssetType;
  asset_code: AssetCode;
  asset_issuer: AccountID;
  amount: string;
}

export interface IPathPaymentOperationData extends IBaseOperationData {
  from: AccountID;
  to: AccountID;
  asset_code: AssetCode;
  asset_issuer: AccountID;
  asset_type: HorizonAssetType;
  amount: string;
  source_asset_code: AssetCode;
  source_asset_issuer: AccountID;
  source_asset_type: string;
  source_max: string;
  source_amount: string;
}

export interface IManageOfferOperationData extends IBaseOperationData {
  offer_id: number;
  amount: string;
  buying_asset_code: AssetCode;
  buying_asset_issuer: AccountID;
  buying_asset_type: HorizonAssetType;
  price: string;
  price_r: { n: number; d: number };
  selling_asset_code: AssetCode;
  selling_asset_issuer: AccountID;
  selling_asset_type: HorizonAssetType;
}

export interface ISetOptionsOperationData extends IBaseOperationData {
  signer_key: AccountID;
  signer_weight: number;
  master_key_weight: number;
  low_threshold: number;
  med_threshold: number;
  high_threshold: number;
  home_domain: string;
  inflation_dest: string;
  set_flags: number[];
  set_flags_s: string[];
  clear_flags: number[];
  clear_flags_s: string[];
}

export interface IChangeTrustOperationData extends IBaseOperationData {
  asset_code: AssetCode;
  asset_issuer: AccountID;
  asset_type: string;
  trustee: AccountID;
  trustor: AccountID;
  limit: string;
}

export interface IAllowTrustOperationData extends IBaseOperationData {
  asset_code: AssetCode;
  asset_issuer: AccountID;
  asset_type: string;
  authorize: boolean;
  trustee: AccountID;
  trustor: AccountID;
}

export interface IAccountMergeOperationData extends IBaseOperationData {
  into: AccountID;
}

export interface IManageDataOperationData extends IBaseOperationData {
  name: string;
  value: string;
}

export interface IBumpSequenceOperationData extends IBaseOperationData {
  bump_to: string;
}

export type IHorizonOperationData = IPaymentOperationData &
  ISetOptionsOperationData &
  IAccountMergeOperationData &
  IAllowTrustOperationData &
  IBumpSequenceOperationData &
  IChangeTrustOperationData &
  ICreateAccountOperationData &
  IManageDataOperationData &
  IManageOfferOperationData &
  IPathPaymentOperationData;

export interface IHorizonTransactionData {
  id: string;
  paging_token: string;
  successful: boolean;
  ledger: number;
  created_at: string;
  source_account: AccountID;
  envelope_xdr: string;
  result_xdr: string;
  result_meta_xdr: string;
  fee_meta_xdr: string;
  memo_type: typeof MemoNone | typeof MemoID | typeof MemoHash | typeof MemoReturn | typeof MemoText;
}
