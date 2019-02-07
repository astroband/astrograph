// This module holds definitions of data types for "raw" objects,
// which are returned from Dgraph storage
import { AccountID } from "../model/account_id";
import { AssetCode } from "../model/asset_code";
import { OperationKinds } from "../model/operation";
import { MemoType } from "../util/stellar";

export interface ITransactionData {
  "tx.id": string;
  "tx.index": string;
  "tx.ledger": ILedgerData[];
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
  "tx.source": IAccountData[];
  "time_bounds.min": number;
  "time_bounds.max": number;
}

interface IOperationData {
  "op.kind": OperationKinds;
  "op.ledger": ILedgerData[];
  "op.index": string;
  "op.transaction": ITransactionData[];
  "op.source": IAccountData[];
  "op.destination": IAccountData[];
}

export interface IPaymentOperationData extends IOperationData {
  amount: string;
  "payment_op.asset": IAssetData[];
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
  "set_options_op.inflation_destination": IAccountData[];
  "set_options_op.signer": {
    account: IAccountData[];
    weight: string;
  };
}

export interface IAllowTrustOperationData extends IOperationData {
  "allow_trust_op.trustor": IAccountData[];
  "allow_trust_op.asset": IAssetData[];
  authorize: boolean;
}

export interface IBumpSequenceOperationData extends IOperationData {
  bump_to: number;
}

export interface IChangeTrustOperationData extends IOperationData {
  limit: string;
  "change_trust_op.asset": IAssetData[];
}

export interface ICreateAccountOperationData extends IOperationData {
  starting_balance: string;
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
  "manage_offer_op.asset_selling": IAssetData[];
  "manage_offer_op.asset_buying": IAssetData[];
  amount: number;
}

export interface IPathPaymentOperationData extends IOperationData {
  send_max: string;
  amount: string;
  "path_payment_op.asset_destination": IAssetData[];
  "path_payment_op.asset_source": IAssetData[];
  "path_payment_op.assets_path": IAssetData[];
}

export type DgraphOperationsData = IPaymentOperationData &
  ISetOptionsOperationData &
  IAllowTrustOperationData &
  IBumpSequenceOperationData &
  IChangeTrustOperationData &
  ICreateAccountOperationData &
  IManageDataOperationData &
  IManageOfferOperationData &
  IPathPaymentOperationData;

export interface IAssetData {
  "asset.id": string;
  code: AssetCode;
  "asset.issuer": IAccountData[];
  native: boolean;
}

export interface IAccountData {
  "account.id": AccountID;
  // it's incomplete
}

export interface ILedgerData {
  close_time: string;
}
