export interface ISigner {
  accountID: string;
  signer: string;
  weight: number;
}

export class Signer implements ISigner {
  public accountID: string;
  public signer: string;
  public weight: number;

  constructor(data: ISigner) {
    this.accountID = data.accountID;
    this.signer = data.signer;
    this.weight = data.weight;
  }
}
