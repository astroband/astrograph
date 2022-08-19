import { AccountID, AssetID, IBalanceBase } from "./";

export class BalanceValues implements IBalanceBase {
  public account: AccountID;
  public asset: AssetID;
  public limit: bigint;
  public balance: bigint;
  public authorized: boolean;

  constructor(data: IBalanceBase) {
    this.account = data.account;
    this.limit = data.limit;
    this.balance = data.balance;
    this.authorized = data.authorized;
    this.asset = data.asset;
  }
}
