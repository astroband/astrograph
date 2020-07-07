import { AccountID, AssetCode, AssetID } from "../model";
import { RequireAtLeastOneProperty } from "../util/types";

export type StorageOpType =
  | "CreateAccount"
  | "Payment"
  | "PathPaymentStrictReceive"
  | "PathPaymentStrictSend"
  | "ManageSellOffer"
  | "ManageBuyOffer"
  | "CreatePassiveSellOffer"
  | "SetOptions"
  | "ChangeTrust"
  | "AllowTrust"
  | "AccountMerge"
  | "ManageData"
  | "BumpSequence"
  | "Inflation";

export interface IAsset {
  code: AssetCode;
  issuer?: AccountID;
  id: AssetID;
}

export interface IBaseOperationData {
  id: string;
  tx_id: string;
  tx_idx: number;
  idx: number;
  seq: number;
  order: number;
  paging_token: string;
  close_time: string;
  successful: boolean;
  result_code: number;
  tx_source_account_id: AccountID;
  type: StorageOpType;
  source_account_id: AccountID;
  memo?: { type: number; value: string };
}

export interface ICreateAccountOperationData extends IBaseOperationData {
  source_amount: string;
  destination_account_id: AccountID;
}

export interface IPaymentOperationData extends IBaseOperationData {
  source_amount: string;
  destination_account_id: AccountID;
  source_asset: IAsset;
}

export interface IPathPaymentStrictReceiveOperationData extends IBaseOperationData {
  destination_account_id: AccountID;
  destination_amount: string;
  destination_asset: IAsset;
  source_amount: string;
  source_asset: IAsset;
  amount_received: string;
  amount_sent: string;
  path: IAsset[];
}

export interface IPathPaymentStrictSendOperationData extends IBaseOperationData {
  destination_account_id: AccountID;
  destination_amount: number;
  destination_asset: IAsset;
  source_amount: string;
  source_asset: IAsset;
  amount_received: string;
  amount_sent: string;
  path: IAsset[];
}

export interface IManageOfferOperationData extends IBaseOperationData {
  source_amount: string;
  source_asset: IAsset;
  offer_id: number;
  offer_price: number;
  offer_price_n_d: { n: number; d: number };
  destination_asset: IAsset;
}

export interface ICreatePassiveSellOfferOperationData extends IBaseOperationData {
  source_amount: string;
  source_asset: IAsset;
  offer_price: number;
  offer_price_n_d: { n: number; d: number };
  destination_asset: IAsset;
}
export interface IAccountFlagsOptionsData {
  required: boolean;
  revocable: boolean;
  immutable: boolean;
}

type SetOptionsOperationData = RequireAtLeastOneProperty<{
  inflation_dest: AccountID;
  home_domain: string;
  thresholds: {
    low: number;
    medium: number;
    high: number;
    master: number;
  };
  set_flags: IAccountFlagsOptionsData;
  clear_flags: IAccountFlagsOptionsData;
  signer: {
    id: AccountID;
    weight: number;
  };
}> &
  IBaseOperationData;

export interface IChangeTrustOperationData extends IBaseOperationData {
  destination_amount: number;
  destination_asset: IAsset;
}

export interface IAllowTrustOperationData extends IBaseOperationData {
  destination_asset: IAsset;
  destination_account_id: AccountID;
  authorize: boolean;
}

export interface IAccountMergeOperationData extends IBaseOperationData {
  destination_account_id: AccountID;
}

export interface IManageDataOperationData extends IBaseOperationData {
  data: {
    name: string;
    value: string;
  };
}

export interface IBumpSequenceOperationData extends IBaseOperationData {
  bump_to: string;
}

export type OperationData = IPaymentOperationData &
  SetOptionsOperationData &
  IAccountMergeOperationData &
  IAllowTrustOperationData &
  IBumpSequenceOperationData &
  IChangeTrustOperationData &
  ICreateAccountOperationData &
  IManageDataOperationData &
  IManageOfferOperationData &
  ICreatePassiveSellOfferOperationData &
  IPathPaymentStrictReceiveOperationData &
  IPathPaymentStrictSendOperationData;

export interface ITransactionData {
  id: string;
  idx: number;
  seq: number;
  order: number;
  max_fee: number;
  fee_charged: number;
  operation_count: number;
  close_time: string; // ISO datetime
  successful: boolean;
  result_code: number;
  source_account_id: AccountID;
  fee_account_id: AccountID;
  memo?: { type: 0 | 1 | 2 | 3 | 4; value: string };
  time_bounds?: { min_time: number; max_time: number };
  paging_token: string;
  meta: string;
  fee_meta: string;
}

export interface ITradeData {
  id: string;
  paging_token: string;
  sold: string;
  bought: string;
  asset_sold: IAsset;
  asset_bought: IAsset;
  sold_offer_id: number;
  seller_id: AccountID;
  buyer_id: AccountID;
  price: string;
  ledger_close_time: string; // ISO datetime
}

export interface ILedgerHeaderData {
  hash: string;
  prev_hash: string;
  bucket_list_hash: string;
  tx_set_result_hash: string;
  seq: number;
  paging_token: string;
  close_time: string; // ISO datetime
  version: number;
  total_coins: number;
  fee_pool: number;
  id_pool: number;
  base_fee: number;
  base_reserve: number;
  max_tx_set_size: number;
}
