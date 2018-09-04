import { DataEntry } from "./data_entry";
import { IPayloadType, PayloadType } from "./payload_type";

import { publicKeyFromXDR } from "../common/xdr";

export class DataEntryEventPayload extends DataEntry implements IPayloadType {
  public static buildFromXDR(payloadType: PayloadType, xdr: any): DataEntryEventPayload {
    const accountid = publicKeyFromXDR(xdr);

    return new DataEntryEventPayload(
      payloadType,
      {
        accountid,
        dataname: xdr.dataName().toString(),
        datavalue: xdr.dataValue()
      }
    );
  }

  public payloadType: PayloadType;

  constructor(payloadType: PayloadType, data: any) {
    super(data);
    this.payloadType = payloadType;
  }
}
