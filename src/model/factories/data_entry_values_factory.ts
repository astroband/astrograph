import { DataEntryValues, IDataEntryValues } from "../data_entry_values";

import { publicKeyFromXDR } from "../../util/xdr";

export class DataEntryValuesFactory {
  public static fromXDR(xdr: any): DataEntryValues {
    const accountID = publicKeyFromXDR(xdr);

    const data: IDataEntryValues = {
      accountID,
      name: xdr.dataName().toString(),
      value: xdr.dataValue()
    };

    return new DataEntryValues(data);
  }
}
