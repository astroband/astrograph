// This module holds definitions of operations data types,
// which we serve from GraphQL server. These are "processed" counterparts
// of data that is stored in Dgraph
import { Asset } from "stellar-sdk";
import { IAssetInput } from "../../../model/asset_input";

export enum OperationKinds {
  Payment = "payment",
  SetOption = "setOption"
}

export interface IBaseOperation {
  kind: OperationKinds;
  account: string;
  transactionId: string;
  index: number;
  dateTime: Date;
}

export interface IPaymentOperation extends IBaseOperation {
  source: string | null;
  destination: string;
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
  inflationDestination: string;
  signer: {
    account: string;
    weight: number;
  };
}

export type Operation = IPaymentOperation | ISetOptionsOperation;

// What filters for different operations we provide
export interface ISetOptionsOpsQueryParams {
  masterWeight: number;
  account: string;
}

export interface IPaymentsQueryParams {
  asset: IAssetInput | null;
  destination: string | null;
  source: string | null;
}
