import stellar from "stellar-base";
import { Asset } from "stellar-sdk";

import { Account } from "./account";

import { MAX_INT64 } from "../util";
import { toFloatAmountString } from "../util/stellar";

export interface ITrustLine {
  accountID: string;
  asset: Asset;
  limit: string;
  balance: string;
  authorized: boolean;
  lastModified: number;
}

export class TrustLine implements ITrustLine {
  public static buildFakeNative(account: Account): ITrustLine {
    return {
      accountID: account.id,
      asset: Asset.native(),
      balance: toFloatAmountString(account.balance),
      limit: toFloatAmountString(MAX_INT64),
      authorized: true,
      lastModified: account.lastModified
    };
  }

  public accountID: string;
  public asset: Asset;
  public limit: string;
  public balance: string;
  public authorized: boolean;
  public lastModified: number;

  constructor(data: {
    accountid: string;
    assettype: number;
    issuer: string;
    assetcode: string;
    tlimit: string;
    balance: string;
    flags: number;
    lastmodified: number;
  }) {
    this.accountID = data.accountid;
    this.limit = toFloatAmountString(data.tlimit);
    this.balance = toFloatAmountString(data.balance);
    this.lastModified = data.lastmodified;
    this.authorized = (data.flags & stellar.xdr.TrustLineFlags.authorizedFlag().value) > 0;

    this.asset =
      data.assettype === stellar.xdr.AssetType.assetTypeNative().value
        ? Asset.native()
        : new Asset(data.assetcode, data.issuer);
  }
}
