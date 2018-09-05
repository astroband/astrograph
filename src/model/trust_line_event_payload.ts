import { IMutationType, MutationType } from "./payload_type";
import { TrustLine } from "./trust_line";

import { assetFromXDR, publicKeyFromXDR } from "../common/xdr";

export class TrustLineEventPayload extends TrustLine implements IMutationType {
  public static buildFromXDR(mutationType: MutationType, xdr: any): TrustLineEventPayload {
    const { assettype, assetcode, issuer } = assetFromXDR(xdr);

    return new TrustLineEventPayload(mutationType, {
      accountid: publicKeyFromXDR(xdr),
      balance: xdr.balance().toString(),
      tlimit: xdr.limit().toString(),
      flags: xdr.flags(),
      assettype,
      assetcode,
      issuer
    });
  }

  public mutationType: MutationType;

  constructor(mutationType: MutationType, data: any) {
    super(data);
    this.mutationType = mutationType;
  }
}
