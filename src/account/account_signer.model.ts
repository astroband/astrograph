// TODO: signer == account
export default class AccountSigner {
  public accountID: string;
  public signer: string;
  public weight: number;

  constructor(data: { accountid: string; signer: string; weight: number }) {
    this.accountid = data.accountid;
    this.signer = data.signer;
    this.weight = data.weight;
  }
}
