import { AccountID, AssetID } from "./";

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
  ManageOffer = "manageOffer",
  CreatePassiveOffer = "createPassiveOffer",
  PathPayment = "pathPayment"
}

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
  asset: AssetID;
  amount: string;
}

export interface ISetOptionsOperation extends IBaseOperation {
  masterWeight: number;
  homeDomain: string;
  clearFlags: AccountFlagsOption[];
  setFlags: AccountFlagsOption[];
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
  asset: AssetID;
  trustor: AccountID;
  authorize: boolean;
}

export interface IBumpSequenceOperation extends IBaseOperation {
  bumpTo: number;
}

export interface IChangeTrustOperation extends IBaseOperation {
  limit: string;
  asset: AssetID;
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
  price: string;
  priceComponents: { n: number; d: number };
  assetBuying: AssetID;
  assetSelling: AssetID;
}

export interface ICreatePassiveOfferOperation extends IBaseOperation {
  amount: string;
  price: string;
  priceComponents: { n: number; d: number };
  assetBuying: AssetID;
  assetSelling: AssetID;
}

// This is more of a "effect" of particular path payment
// Horizon returns data this way, so we use it too
export interface IHorizonPathPaymentOperation extends IBaseOperation {
  sendMax: string;
  amountSent: string;
  amountReceived: string;
  destinationAccount: AccountID;
  destinationAsset: AssetID;
  sourceAsset: AssetID;
}

// This is a "legacy" interface, we ingest path payments to DGraph in this format
export interface IPathPaymentOperation extends IBaseOperation {
  sendMax: string;
  destinationAmount: string;
  destinationAccount: AccountID;
  destinationAsset: AssetID;
  sourceAsset: AssetID;
  path: AssetID[];
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
  | IHorizonPathPaymentOperation
  | IPathPaymentOperation
  | ICreatePassiveOfferOperation;
