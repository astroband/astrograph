import stellar from "stellar-base";
import { Signer, SignerType } from "../signer";

export interface ISignerTableRow {
  accountid: string;
  publickey: string;
  weight: number;
}

export class SignerFactory {
  public static fromXDR(xdr: any) {
    let key: string;
    let type: SignerType;

    switch (xdr.key().switch()) {
      case stellar.xdr.SignerKeyType.signerKeyTypeEd25519():
        key = stellar.StrKey.encodeEd25519PublicKey(xdr.key().ed25519());
        type = "ed25519";
        break;
      case stellar.xdr.SignerKeyType.signerKeyTypePreAuthTx():
        key = stellar.StrKey.encodePreAuthTx(xdr.key().preAuthTx());
        type = "preAuthTx";
        break;
      case stellar.xdr.SignerKeyType.signerKeyTypeHashX():
        key = stellar.StrKey.encodeSha256Hash(xdr.key().hashX());
        type = "hashX";
        break;
      default:
        throw new Error("We've encountered unknown XDR signer type");
    }

    return new Signer({ signer: key, weight: xdr.weight(), type });
  }

  public static self(id: string, weight: number): Signer {
    return new Signer({ signer: id, weight, type: "ed25519" });
  }
}
