import { AccountID, AssetCode } from "../model";

export type StorageOpType =
  | "OperationTypeCreateAccount"
  | "OperationTypePayment"
  | "OperationTypePathPayment"
  | "OperationTypeManageOffer"
  | "OperationTypeCreatePassiveOffer"
  | "OperationTypeSetOptions"
  | "OperationTypeChangeTrust"
  | "OperationTypeAllowTrust"
  | "OperationTypeAccountMerge"
  | "OperationTypeManageData"
  | "OperationTypeBumpSequence";

export interface IAsset {
  code: AssetCode;
  issuer: AccountID;
  key: string;
}

interface IBaseOperationData {
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
  memo: { type: number; value: string };
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

export interface IPathPaymentOperationData extends IBaseOperationData {
  destination_account_id: AccountID;
  destination_amount: number;
  destination_asset: IAsset;
  source_amount: string;
  source_asset: IAsset;
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

export interface ICreatePassiveOfferOperationData extends IBaseOperationData {
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

export interface ISetOptionsOperationData extends IBaseOperationData {
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
    key: AccountID;
    weight: number;
  };
}

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

export type IOperationData = IPaymentOperationData &
  ISetOptionsOperationData &
  IAccountMergeOperationData &
  IAllowTrustOperationData &
  IBumpSequenceOperationData &
  IChangeTrustOperationData &
  ICreateAccountOperationData &
  IManageDataOperationData &
  IManageOfferOperationData &
  ICreatePassiveOfferOperationData &
  IPathPaymentOperationData;
