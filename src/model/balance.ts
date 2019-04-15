import { Asset } from "stellar-sdk";
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
    this.limit = data.limit;
    this.balance = data.balance;
    this.lastModified = data.lastModified;
    this.authorized = data.authorized;
    this.asset = data.asset;
  }

  public get paging_token() {
    return Buffer.from(`${this.account}_${this.asset.toString()}_${this.balance}`).toString("base64");
  }
}
