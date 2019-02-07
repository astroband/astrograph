// This module holds definitions of operations data types,
// which we serve from GraphQL server. These are "processed" counterparts
// of data that is stored in Dgraph
import { AccountID } from "./account_id";
import { Asset } from "./asset";

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
  asset: Asset;
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
  offerId: string;
  price: number;
  priceComponents: { n: string; d: string };
}

export interface IPathPaymentOperation extends IBaseOperation {
  sendMax: string;
  destinationAmount: string;
  destinationAccount: AccountID;
  destinationAsset: Asset;
  sourceAsset: Asset;
  path: Asset[];
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
