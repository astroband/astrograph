import stellar from "stellar-base";

import { Asset } from "./asset";
import { IMutationType, MutationType } from "./mutation_type";
import { TrustLineValues } from "./trust_line_values";

import { assetFromXDR, publicKeyFromXDR } from "../common/xdr";

export class TrustLineSubscriptionPayload implements IMutationType {
  public static buildFromXDR(mutationType: MutationType, xdr: any) {
    const { assettype, assetcode, issuer } = assetFromXDR(xdr);

    let tlimit = "";
    let flags = -1;
    let balance = "";

    if (mutationType !== MutationType.Remove) {
      tlimit = xdr.limit().toString();
      flags = xdr.flags();
      balance = xdr.balance().toString();
    }

    return new TrustLineSubscriptionPayload(mutationType, {
      accountid: publicKeyFromXDR(xdr),
      assettype,
      assetcode,
      issuer,
      tlimit,
      flags,
      balance,
      lastmodified: -1
    });
  }

  public accountID: string;
  public asset: Asset;
  public mutationType: MutationType;
  public values: TrustLineValues | null = null;

  constructor(
    mutationType: MutationType,
    data: {
      accountid: string;
      balance: string;
      tlimit: string;
      flags: number;
      assettype: number;
      assetcode: string;
      issuer: string;
      lastmodified: number;
    }
  ) {
    this.accountID = data.accountid;
    this.asset = new Asset(
      data.assettype === stellar.xdr.AssetType.assetTypeNative().value,
      data.assetcode,
      data.issuer
    );
    this.mutationType = mutationType;

    if (this.mutationType !== MutationType.Remove) {
      this.values = new TrustLineValues(data);
    }
  }
}
