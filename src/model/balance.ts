import { BigNumber } from "bignumber.js";
import { Asset } from "stellar-sdk";
import { AccountID, AssetID } from "./";

export interface IBalanceBase {
  account: AccountID;
  asset: Asset;
  limit: BigNumber;
  balance: BigNumber;
  authorized: boolean;
}

export interface IBalance extends IBalanceBase {
  lastModified: number;
  spendableBalance: BigNumber;
  receivableBalance: BigNumber;
}

export class Balance implements IBalance {
  public static parsePagingToken(token: string): [AccountID, AssetID, string] {
    return Buffer.from(token, "base64")
      .toString()
      .split("_") as [AccountID, AssetID, string];
  }

  public account: AccountID;
  public asset: Asset;
  public readonly limit: BigNumber;
  public readonly balance: BigNumber;
  public authorized: boolean;
  public lastModified: number;

  public readonly spendableBalance: BigNumber;
  public readonly receivableBalance: BigNumber;

  constructor(data: IBalance) {
    this.account = data.account;
    this.limit = data.limit;
    this.balance = data.balance;
    this.lastModified = data.lastModified;
    this.authorized = data.authorized;
    this.asset = data.asset;
    this.spendableBalance = data.spendableBalance;
    this.receivableBalance = data.receivableBalance;
  }

  public get paging_token() {
    return Buffer.from(`${this.account}_${this.asset.toString()}_${this.balance}`).toString("base64");
  }
}
