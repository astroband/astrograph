import { DataEntry } from "./data_entry";
import { IMutationType, MutationType } from "./payload_type";

import { publicKeyFromXDR } from "../common/xdr";

export class DataEntryEventPayload extends DataEntry implements IMutationType {
  public static buildFromXDR(mutationType: MutationType, xdr: any): DataEntryEventPayload {
    const accountid = publicKeyFromXDR(xdr);

    return new DataEntryEventPayload(
      mutationType,
      {
        accountid,
        dataname: xdr.dataName().toString(),
        datavalue: xdr.dataValue()
      }
    );
  }

  public mutationType: MutationType;

  constructor(mutationType: MutationType, data: any) {
    super(data);
    this.mutationType = mutationType;
  }
}
