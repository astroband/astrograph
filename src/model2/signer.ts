export interface ISigner {
  accountID: string;
  signer: string;
  weight: number;
}

export interface ISignerTableRow {
  accountid: string;
  publickey: string;
  weight: number;
}

export class Signer implements ISigner {
  public static buildFromXDR(xdr: any, accountID: string) {
    const data = {
      accountid: accountID,
      publickey: signerKeyFromXDR(xdr.key()),
      weight: xdr.weight()
    };

    return new Signer(data);
  }

  public static fromDb(row: ISignerTableRow) {
    this.accountID = row.accountid;
    this.signer = row.publickey;
    this.weight = row.weight;
  }

  public accountID: string;
  public signer: string;
  public weight: number;

  constructor(data: ISigner) {
    this.accountID = data.accountID;
    this.signer = data.signer;
    this.weight = data.weight;
  }
}
