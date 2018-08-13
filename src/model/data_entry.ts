export class DataEntry {
  public accountID: string;
  public name: string;
  public value: string;
  public lastModified: number;

  constructor(data: { accountid: string; dataname: string; datavalue: string; lastmodified: number }) {
    this.accountID = data.accountid;
    this.name = data.dataname;
    this.value = Buffer.from(data.datavalue, "base64").toString();
    this.lastModified = data.lastmodified;
  }
}
