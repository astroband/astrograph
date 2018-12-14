import stellar from "stellar-base";

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
  public static fromXDR(xdr: any, accountID: string) {
    const data: ISigner = {
      accountID,
      signer: Signer.keyFromXDR(xdr.key()),
      weight: xdr.weight()
    };

    return new Signer(data);
  }

  public static fromDb(row: ISignerTableRow): Signer {
    const data: ISigner = {
      accountID: row.accountid,
      signer: row.publickey,
      weight: row.weight
    };

    return new Signer(data);
  }

  public static keyFromXDR(xdr: any): string {
    switch (xdr.switch()) {
      case stellar.xdr.SignerKeyType.signerKeyTypeEd25519():
        return stellar.StrKey.encodeEd25519PublicKey(xdr.ed25519());

      case stellar.xdr.SignerKeyType.signerKeyTypePreAuthTx():
        return stellar.StrKey.encodePreAuthTx(xdr.preAuthTx());
    }

    if (xdr.switch() !== stellar.xdr.SignerKeyType.signerKeyTypeHashX()) {
      throw new Error("We've encountered unknown XDR signer type");
    }

    return stellar.StrKey.encodeSha256Hash(xdr.hashX());
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
