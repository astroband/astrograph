// This module holds definitions of operations data types,
// which we serve from GraphQL server. These are "processed" counterparts
// of data that is stored in Dgraph
import { Asset } from "stellar-sdk";
import { IAssetInput } from "../../../model/asset_input";
import { AccountID, AssetCode } from "../../../util/types";

export enum OperationKinds {
  Payment = "payment",
  SetOption = "setOption",
  AccountMerge = "accountMerge",
  AllowTrust = "allowTrust",
  BumpSequence = "bumpSequence",
  ChangeTrust = "changeTrust",
  CreateAccount = "createAccount",
  ManageData = "manageDatum"
}

export interface IBaseOperation {
  kind: OperationKinds;
  account: AccountID;
  transactionId: string;
  index: number;
  dateTime: Date;
}

export interface IPaymentOperation extends IBaseOperation {
  source: AccountID | null;
  destination: AccountID;
  asset: Asset;
  amount: string;
}

export interface ISetOptionsOperation extends IBaseOperation {
  masterWeight: number;
  homeDomain: string;
  clearFlags: number;
  setFlags: number;
  thresholds: {
    high: number;
    medium: number;
    low: number;
  };
  inflationDestination: AccountID;
  signer: {
    account: AccountID;
    weight: number;
  };
}

export interface IAccountMergeOperation extends IBaseOperation {
  destination: AccountID;
}

export interface IAllowTrustOperation extends IBaseOperation {
  assetCode: AssetCode;
  trustor: AccountID;
  authorize: boolean;
}

export interface IBumpSequenceOperation extends IBaseOperation {
  bumpTo: number;
}

export interface IChangeTrustOperation extends IBaseOperation {
  limit: string;
  asset: Asset;
}

export interface ICreateAccountOperation extends IBaseOperation {
  startingBalance: string;
  destination: AccountID;
}

export interface IManageDataOperation extends IBaseOperation {
  name: string;
  value: string;
}

export type Operation =
  | IPaymentOperation
  | ISetOptionsOperation
  | IAccountMergeOperation
  | IAllowTrustOperation
  | IBumpSequenceOperation
  | IChangeTrustOperation
  | ICreateAccountOperation
  | IManageDataOperation;

// What filters for different operations we provide
export interface ISetOptionsOpsQueryParams {
  masterWeight: number;
  account: AccountID;
}

export interface IPaymentsQueryParams {
  asset: IAssetInput | null;
  destination: AccountID | null;
  source: AccountID | null;
}

export interface IAccountMergeQueryParams {
  destination: AccountID | null;
}

export interface IAllowTrustQueryParams {
  authorize: boolean;
  assetCode: AssetCode;
  trustor: AccountID;
}

export interface IBumpSequenceQueryParams {
  bumpTo: number;
}

export interface IChangeTrustQueryParams {
  limit: string;
  asset: IAssetInput;
}

export interface ICreateAccountQueryParams {
  destination: AccountID;
}

export interface IManageDataQueryParams {
  name: string;
  value: string;
}
