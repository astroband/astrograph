import { DataEntry } from "./data_entry";

import { publicKeyFromXDR } from "../common/xdr";

export class DataEntryValues extends DataEntry {
  public static buildFromXDR(xdr: any): DataEntryValues {
    const accountid = publicKeyFromXDR(xdr);

    return new DataEntryValues({
      accountid,
      dataname: xdr.dataName().toString(),
      datavalue: xdr.dataValue(),
      lastmodified: -1 // Just placeholder, will not be projected down to payload
    });
  }
}
