// TODO: signer == load account
export default class Signer {
  public accountID: string;
  public signer: string;
  public weight: number;

  constructor(data: { accountid: string; publickey: string; weight: number }) {
    this.accountID = data.accountid;
    this.signer = data.publickey;
    this.weight = data.weight;
  }
}
