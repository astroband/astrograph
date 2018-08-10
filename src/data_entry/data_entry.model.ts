export default class DataEntry {
  public accountID: string;
  public name: string;
  public value: string;
  public lastModified: number;

  constructor(data: { accountid: string; name: string; value: string; lastModified: number }) {
    this.accountID = data.accountid;
    this.name = data.name;
    this.value = Buffer.from(data.value, "base64");
    this.lastModified = data.lastModified;
  }
}
