export interface IDataEntryValues {
  accountID: string;
  name: string;
  value: string;
}

export class DataEntryValues implements IDataEntryValues {
  public accountID: string;
  public name: string;
  public value: string;

  constructor(data: IDataEntryValues) {
    this.accountID = data.accountID;
    this.name = data.name;
    this.value = data.value;
  }
}
