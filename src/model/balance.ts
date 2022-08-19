import { AccountID, AssetID } from "./";

export interface IBalanceBase {
  account: AccountID;
  asset: AssetID;
  limit: bigint;
  balance: bigint;
  authorized: boolean;
}

export interface IBalance extends IBalanceBase {
  lastModified: number;
  spendableBalance: bigint;
  receivableBalance: bigint;
}

export class Balance implements IBalance {
  public static parsePagingToken(token: string): [AccountID, AssetID, string] {
    return Buffer.from(token, "base64")
      .toString()
      .split("_") as [AccountID, AssetID, string];
  }

  public account: AccountID;
  public asset: AssetID;
  public authorized: boolean;
  public lastModified: number;

  public readonly limit: bigint;
  public readonly balance: bigint;
  public readonly spendableBalance: bigint;
  public readonly receivableBalance: bigint;

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
