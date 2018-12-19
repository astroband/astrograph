import { DataEntry, IDataEntry } from "..";

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
      name: row.dataname,
      value: Buffer.from(row.datavalue, "base64").toString(),
      lastModified: row.lastmodified
    };

    return new DataEntry(data);
  }
}
