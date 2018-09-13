import stellar from "stellar-base";

import { Account } from "./account";
import { Asset } from "./asset";

import { MAX_INT64 } from "../common";
import { toFloatAmountString, NativeAssetCode } from "../common/util/stellar";
import { publicKeyFromXDR } from "../common/xdr";

export class TrustLine {
  // TODO: make it consistent with buildFakeNativeData
  public static buildFakeNativeDataFromXDR(xdr: any) {
    return {
      accountid: publicKeyFromXDR(xdr),
      assettype: stellar.xdr.AssetType.assetTypeNative().value,
      assetcode: NativeAssetCode,
      issuer: stellar.Keypair.master().publicKey(),
      lastmodified: -1,
      tlimit: MAX_INT64,
      flags: 1,
      balance: xdr.balance().toString()
    };
  }

  public static buildFakeNativeData(account: Account) {
    return {
      accountid: account.id,
      assettype: stellar.xdr.AssetType.assetTypeNative().value,
      assetcode: NativeAssetCode,
      issuer: stellar.Keypair.master().publicKey(),
      lastmodified: account.lastModified,
      tlimit: MAX_INT64,
      flags: 1,
      balance: account.balance
    };
  }

  public static buildFakeNative(account: Account) {
    return new TrustLine(this.buildFakeNativeData(account));
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

    this.asset = new Asset(
      // we want to handle native balance
      // like a trustline too, for consistency
      data.assettype === stellar.xdr.AssetType.assetTypeNative().value,
      data.assetcode,
      data.issuer
    );
  }
}
