export interface IDataEntryBase {
  accountID: string;
  name: string;
  value: string;
}

export interface IDataEntry extends IDataEntryBase {
  lastModified: number;
}

export class DataEntry implements IDataEntry {
  public accountID: string;
  public name: string;
  public value: string;
  public lastModified: number;

  constructor(data: IDataEntry) {
    this.accountID = data.accountID;
    this.name = data.name;
    this.value = data.value;
    this.lastModified = data.lastModified;
  }
}
