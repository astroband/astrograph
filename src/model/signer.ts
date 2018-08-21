import { signerKeyFromXDR } from "../common/xdr";

export class Signer {
  public static buildFromXDR(xdr: any, accountID: string) {
    const data = {
      accountid: accountID,
      publickey: signerKeyFromXDR(xdr.key()),
      weight: xdr.weight()
    };

    return new Signer(data);
  }

  public accountID: string;
  public signer: string;
  public weight: number;

  constructor(data: { accountid: string; publickey: string; weight: number }) {
    this.accountID = data.accountid;
    this.signer = data.publickey;
    this.weight = data.weight;
  }
}
