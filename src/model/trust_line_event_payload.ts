import { IPayloadType, PayloadType } from "./payload_type";
import { TrustLine } from "./trust_line";

import { assetFromXDR, publicKeyFromXDR } from "../common/xdr";

export class TrustLineEventPayload extends TrustLine implements IPayloadType {
  public static buildFromXDR(payloadType: PayloadType, xdr: any): TrustLineEventPayload {
    const { assettype, assetcode, issuer } = assetFromXDR(xdr);

    return new TrustLineEventPayload(payloadType, {
      accountid: publicKeyFromXDR(xdr),
      balance: xdr.balance().toString(),
      tlimit: xdr.limit().toString(),
      flags: xdr.flags(),
      assettype,
      assetcode,
      issuer
    });
  }

  public payloadType: PayloadType;

  constructor(payloadType: PayloadType, data: any) {
    super(data);
    this.payloadType = payloadType;
  }
}
