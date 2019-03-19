import { Asset } from "stellar-sdk";
import { AccountID } from "./account_id";
import { AssetCode } from "./asset_code";

export enum OperationKinds {
  Payment = "payment",
  SetOption = "setOption",
  AccountMerge = "accountMerge",
  AllowTrust = "allowTrust",
  BumpSequence = "bumpSequence",
  ChangeTrust = "changeTrust",
  CreateAccount = "createAccount",
  ManageData = "manageDatum",
  ManageOffer = "manageOffer",
  PathPayment = "pathPayment"
}

export interface IBaseOperation {
  id: string;
  kind: OperationKinds;
  account: AccountID;
  transactionId: string;
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
  clearFlags: string[];
  setFlags: string[];
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

export interface IManageOfferOperation extends IBaseOperation {
  amount: string;
  offerId: number;
  price: string;
  priceComponents: { n: number; d: number };
}

export interface IPathPaymentOperation extends IBaseOperation {
  sendMax: string;
  amountSent: string;
  amountReceived: string;
  destinationAccount: AccountID;
  destinationAsset: Asset;
  sourceAsset: Asset;
}

export type Operation =
  | IPaymentOperation
  | ISetOptionsOperation
  | IAccountMergeOperation
  | IAllowTrustOperation
  | IBumpSequenceOperation
  | IChangeTrustOperation
  | ICreateAccountOperation
  | IManageDataOperation
  | IManageOfferOperation
  | IPathPaymentOperation;
