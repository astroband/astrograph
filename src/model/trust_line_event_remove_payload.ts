import { Asset } from "./asset";
import { IPayloadType, PayloadType } from "./payload_type";

import { assetFromXDR, publicKeyFromXDR } from "../common/xdr";

export class TrustLineEventRemovePayload implements IPayloadType {
  public static buildFromXDR(payloadType: PayloadType, xdr: any): TrustLineEventRemovePayload {
    const { assettype, assetcode, issuer } = assetFromXDR(xdr);
    const asset = new Asset(assettype, assetcode, issuer);

    return new TrustLineEventRemovePayload(payloadType, asset, publicKeyFromXDR(xdr));
  }

  public accountID: string;
  public asset: Asset;
  public payloadType: PayloadType;

  constructor(payloadType: PayloadType, asset: Asset, id: string) {
    this.accountID = id;
    this.payloadType = payloadType;
    this.asset = asset;
  }
}
