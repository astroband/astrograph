import { Asset } from "stellar-sdk";

export interface IPaymentOperation {
  source: string | null;
  destination: string;
  asset: Asset;
  amount: string;
  dateTime: Date;
}
