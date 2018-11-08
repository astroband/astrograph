import { Asset } from "stellar-sdk";
import { TrustLine } from "./trust_line";

import { publicKeyFromXDR } from "../util/xdr";

export class TrustLineValues extends TrustLine {
  public static buildFromXDR(xdr: any): TrustLineValues {
    const asset = Asset.fromOperation(xdr.asset());

    return new TrustLineValues({
      accountid: publicKeyFromXDR(xdr),
      balance: xdr.balance().toString(),
      tlimit: xdr.limit().toString(),
      flags: xdr.flags(),
      assettype: xdr.asset().switch().value,
      assetcode: asset.getCode(),
      issuer: asset.getIssuer(),
      lastmodified: -1
    });
  }
}
