import { IDataEntryBase } from "./data_entry";

export type IDataEntryValues = IDataEntryBase;

export class DataEntryValues implements IDataEntryBase {
  public accountID: string;
  public name: string;
  public value: string;

  constructor(data: IDataEntryBase) {
    this.accountID = data.accountID;
    this.name = data.name;
    this.value = data.value;
  }
}
