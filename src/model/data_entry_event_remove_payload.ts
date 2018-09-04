import { IPayloadType, PayloadType } from "./payload_type";

import { publicKeyFromXDR } from "../common/xdr";

export class DataEntryEventRemovePayload implements IPayloadType {
  public static buildFromXDR(payloadType: PayloadType, xdr: any): DataEntryEventRemovePayload {
    return new DataEntryEventRemovePayload(payloadType, publicKeyFromXDR(xdr), xdr.dataName().toString());
  }

  public accountID: string;
  public payloadType: PayloadType;
  public name: string;

  constructor(payloadType: PayloadType, id: string, name: string) {
    this.accountID = id;
    this.payloadType = payloadType;
    this.name = name;
  }
}
