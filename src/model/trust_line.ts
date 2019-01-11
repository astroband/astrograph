import { Asset } from "stellar-sdk";
import { toFloatAmountString } from "../util/stellar";

export interface ITrustLineBase {
  accountID: string;
  asset: Asset;
  limit: string;
  balance: string;
  authorized: boolean;
}

export interface ITrustLine extends ITrustLineBase {
  lastModified: number;
}

export class TrustLine implements ITrustLine {
  public accountID: string;
  public asset: Asset;
  public limit: string;
  public balance: string;
  public authorized: boolean;
  public lastModified: number;

  constructor(data: ITrustLine) {
    this.accountID = data.accountID;
    this.limit = toFloatAmountString(data.limit);
    this.balance = toFloatAmountString(data.balance);
    this.lastModified = data.lastModified;
    this.authorized = data.authorized;
    this.asset = data.asset;
  }
}
