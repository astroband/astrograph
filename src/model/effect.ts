import { Asset } from "stellar-sdk";
import { AccountID } from "./";

export enum EffectType {
  AccountCreated = "accountCreated",
  AccountRemoved = "accountRemoved",
  AccountCredited = "accountCredited",
  AccountDebited = "accountDebited",
  AccountThresholdsUpdated = "accountThresholdsUpdated",
  AccountHomeDomainUpdated = "accountHomeDomainUpdated",
  AccountFlagsUpdated = "accountFlagsUpdated",
  AccountInflationDestinationUpdated = "accountInflationDestinationUpdated",
  SignerCreated = "signerCreated",
  SignerRemoved = "signerRemoved",
  SignerUpdated = "signerUpdated",
  TrustlineCreated = "trustlineCreated",
  TrustlineRemoved = "trustlineRemoved",
  TrustlineUpdated = "trustlineUpdated",
  TrustlineAuthorized = "trustlineAuthorized",
  TrustlineDeauthorized = "trustlineDeauthorized",
  OfferCreated = "offerCreated",
  OfferRemoved = "offerRemoved",
  OfferUpdated = "offerUpdated",
  Trade = "trade",
  DataCreated = "dataCreated",
  DataRemoved = "dataRemoved",
  DataUpdated = "dataUpdated",
  SequenceBumped = "sequenceBumped"
}

export interface IBaseEffect {
  id: string;
  account: AccountID;
  type: EffectType;
  createdAt: Date;
}

export interface IAccountCreatedEffect extends IBaseEffect {
  startingBalance: string;
}

export interface IAccountCreditedEffect extends IBaseEffect {
  amount: string;
}

export interface IAccountDebitedEffect extends IBaseEffect {
  amount: string;
}

export interface IAccountThresholdsUpdatedEffect extends IBaseEffect {
  lowThreshold: number;
  medThreshold: number;
  highThreshold: number;
}

export interface IAccountHomeDomainUpdatedEffect extends IBaseEffect {
  homeDomain: string;
}

export interface IAccountFlagsUpdatedEffect extends IBaseEffect {
  authRequiredFlag?: boolean;
  authRevocableFlag?: boolean;
}

export interface ISignerCreatedEffect extends IBaseEffect {
  weight: number;
  publicKey: AccountID;
  key: AccountID;
}

export interface ISignerRemovedEffect extends IBaseEffect {
  weight: number;
  publicKey: AccountID;
  key: AccountID;
}

export interface ISignerUpdatedEffect extends IBaseEffect {
  weight: number;
  publicKey: AccountID;
  key: AccountID;
}

export interface ITrustlineCreatedEffect extends IBaseEffect {
  asset: Asset;
  limit: string;
}

export interface ITrustlineRemovedEffect extends IBaseEffect {
  asset: Asset;
  limit: string;
}

export interface ITrustlineUpdatedEffect extends IBaseEffect {
  asset: Asset;
  limit: string;
}

export interface ITrustlineAuthorizedEffect extends IBaseEffect {
  trustor: AccountID;
  asset: Asset;
}

export interface ITrustlineDeauthorizedEffect extends IBaseEffect {
  trustor: AccountID;
  asset: Asset;
}

export interface ITradeEffect extends IBaseEffect {
  seller: AccountID;
  offerId: string;
  soldAmount: string;
  soldAsset: Asset;
  boughtAmount: string;
  boughtAsset: Asset;
}

export interface ISequenceBumpEffect extends IBaseEffect {
  newSeq: number;
}

export type Effect =
  | IAccountCreatedEffect
  | IAccountCreditedEffect
  | IAccountDebitedEffect
  | IAccountThresholdsUpdatedEffect
  | IAccountThresholdsUpdatedEffect
  | IAccountHomeDomainUpdatedEffect
  | IAccountFlagsUpdatedEffect
  | ISignerCreatedEffect
  | ISignerCreatedEffect
  | ISignerRemovedEffect
  | ISignerUpdatedEffect
  | ITrustlineCreatedEffect
  | ITrustlineRemovedEffect
  | ITrustlineUpdatedEffect
  | ITrustlineAuthorizedEffect
  | ITrustlineAuthorizedEffect
  | ITrustlineDeauthorizedEffect
  | ITradeEffect
  | ISequenceBumpEffect;
