import { TrustLine } from "./trust_line";

import { assetFromXDR, publicKeyFromXDR } from "../common/xdr";

export class TrustLineValues extends TrustLine {
  public static buildFromXDR(xdr: any): TrustLineValues {
    const { assettype, assetcode, issuer } = assetFromXDR(xdr);

    return new TrustLineValues({
      accountid: publicKeyFromXDR(xdr),
      balance: xdr.balance().toString(),
      tlimit: xdr.limit().toString(),
      flags: xdr.flags(),
      assettype,
      assetcode,
      issuer,
      lastmodified: -1
    });
  }
}
