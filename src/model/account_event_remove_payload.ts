import { IPayloadType, PayloadType } from "./payload_type";

import { publicKeyFromXDR } from "../common/xdr";

export class AccountEventRemovePayload implements IPayloadType {
  public static buildFromXDR(payloadType: PayloadType, xdr: any): AccountEventRemovePayload {
    return new AccountEventRemovePayload(payloadType, publicKeyFromXDR(xdr));
  }

  public accountID: string;
  public payloadType: PayloadType;

  constructor(payloadType: PayloadType, id: string) {
    this.accountID = id;
    this.payloadType = payloadType;
  }
}
