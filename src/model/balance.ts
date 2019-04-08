import { Asset } from "stellar-sdk";
import { toFloatAmountString } from "../util/stellar";
import { AccountID } from "./account_id";

export interface IBalanceBase {
  account: AccountID;
  asset: Asset;
  limit: string;
  balance: string;
  authorized: boolean;
}

export interface IBalance extends IBalanceBase {
  lastModified: number;
}

export class Balance implements IBalance {
  public account: AccountID;
  public asset: Asset;
  public limit: string;
  public balance: string;
  public authorized: boolean;
  public lastModified: number;

  constructor(data: IBalance) {
    this.account = data.account;
    this.limit = toFloatAmountString(data.limit);
    this.balance = toFloatAmountString(data.balance);
    this.lastModified = data.lastModified;
    this.authorized = data.authorized;
    this.asset = data.asset;
  }
}
