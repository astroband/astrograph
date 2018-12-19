import { Asset } from "stellar-sdk";
import { toFloatAmountString } from "../util/stellar";
import { ITrustLineBase } from "./trust_line";

export class TrustLineValues implements ITrustLineBase {
  public accountID: string;
  public asset: Asset;
  public limit: string;
  public balance: string;
  public authorized: boolean;

  constructor(data: ITrustLineBase) {
    this.accountID = data.accountID;
    this.limit = toFloatAmountString(data.limit);
    this.balance = toFloatAmountString(data.balance);
    this.authorized = data.authorized;
    this.asset = data.asset;
  }
}
