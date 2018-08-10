// TODO: signer == load account
export default class Signer {
  public accountID: string;
  public signer: string;
  public weight: number;

  constructor(data: { accountid: string; signer: string; weight: number }) {
    this.accountID = data.accountid;
    this.signer = data.signer;
    this.weight = data.weight;
  }
}
