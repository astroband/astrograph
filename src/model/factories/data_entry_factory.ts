import { DataEntry, IDataEntry } from "../data_entry";

export interface IDataEntryTableRow {
  accountid: string;
  dataname: string;
  datavalue: string;
  lastmodified: number;
}

export class DataEntryFactory {
  public static fromDb(row: IDataEntryTableRow): DataEntry {
    const data: IDataEntry = {
      accountID: row.accountid,
      name: Buffer.from(row.dataname, "base64").toString(),
      value: Buffer.from(row.datavalue, "base64").toString(),
      lastModified: row.lastmodified
    };

    return new DataEntry(data);
  }
}
