import stellar from "stellar-base";
import { AccountID } from "./";

export type AccountFlagsOption = "authRequired" | "authImmutable" | "authRevocable";

export enum OperationType {
  Payment = "payment",
  SetOption = "setOption",
  AccountMerge = "accountMerge",
  AllowTrust = "allowTrust",
  BumpSequence = "bumpSequence",
  ChangeTrust = "changeTrust",
  CreateAccount = "createAccount",
  ManageData = "manageDatum",
  ManageSellOffer = "manageSellOffer",
  ManageBuyOffer = "manageBuyOffer",
  CreatePassiveSellOffer = "createPassiveSellOffer",
  PathPayment = "pathPaymentStrictReceive",
  Inflation = "inflation",
  PathPaymentStrictSend = "pathPaymentStrictSend"
}

export const PaymentOperations = [
  OperationType.CreateAccount,
  OperationType.Payment,
  OperationType.PathPayment,
  OperationType.AccountMerge
];

export interface IBaseOperation {
  id?: string;
  type: OperationType;
  sourceAccount: AccountID;
  tx: { id: string; sourceAccount?: AccountID };
  index: number;
  dateTime: Date;
}

export interface IPaymentOperation extends IBaseOperation {
  destination: AccountID;
  asset: stellar.Asset;
  amount: string;
}

export interface ISetOptionsOperation extends IBaseOperation {
  masterWeight?: number;
  homeDomain?: string;
  clearFlags?: AccountFlagsOption[];
  setFlags?: AccountFlagsOption[];
  thresholds?: {
    high: number;
    medium: number;
    low: number;
  };
  inflationDestination?: AccountID;
  signer?: {
    account: AccountID;
    weight: number;
  };
}

export interface IAccountMergeOperation extends IBaseOperation {
  destination: AccountID;
}

export interface IAllowTrustOperation extends IBaseOperation {
  asset: stellar.Asset;
  trustor: AccountID;
  authorize: boolean;
}

export interface IBumpSequenceOperation extends IBaseOperation {
  bumpTo: number;
}

export interface IChangeTrustOperation extends IBaseOperation {
  limit: string;
  asset: stellar.Asset;
}

export interface ICreateAccountOperation extends IBaseOperation {
  startingBalance: string;
  destination: AccountID;
}

export interface IManageDataOperation extends IBaseOperation {
  name: string;
  value: string;
}

export interface IManageSellOfferOperation extends IBaseOperation {
  amount: string;
  offerId: string;
  price: string;
  priceComponents: { n: number; d: number };
  assetBuying: stellar.Asset;
  assetSelling: stellar.Asset;
}

export interface IManageBuyOfferOperation extends IBaseOperation {
  amount: string;
  offerId: string;
  price: string;
  priceComponents: { n: number; d: number };
  assetBuying: stellar.Asset;
  assetSelling: stellar.Asset;
}

export interface ICreatePassiveSellOfferOperation extends IBaseOperation {
  amount: string;
  price: string;
  priceComponents: { n: number; d: number };
  assetBuying: stellar.Asset;
  assetSelling: stellar.Asset;
}

// This is more of a "effect" of particular path payment
// Horizon returns data this way, so we use it too
export interface IHorizonPathPaymentOperation extends IBaseOperation {
  sendMax: string;
  amountSent: string;
  amountReceived: string;
  destinationAccount: AccountID;
  destinationAsset: stellar.Asset;
  sourceAsset: stellar.Asset;
}

export interface IPathPaymentOperation extends IBaseOperation {
  sendMax: string;
  amountSent: string;
  amountReceived: string;
  destinationAccount: AccountID;
  destinationAsset: stellar.Asset;
  sourceAsset: stellar.Asset;
}

export interface IPathPaymentStrictSendOperation extends IBaseOperation {
  destinationMin: string;
  amountSent: string;
  amountReceived: string;
  destinationAccount: AccountID;
  destinationAsset: stellar.Asset;
  sourceAsset: stellar.Asset;
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
  | IManageSellOfferOperation
  | IManageBuyOfferOperation
  | IPathPaymentOperation
  | ICreatePassiveSellOfferOperation
  | IPathPaymentStrictSendOperation
  | ICreatePassiveSellOfferOperation
  | IPathPaymentStrictSendOperation;
