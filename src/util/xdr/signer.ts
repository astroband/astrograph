import stellar from "stellar-base";

export function signerKeyFromXDR(xdr: any) {
  switch (xdr.switch()) {
    case stellar.xdr.SignerKeyType.signerKeyTypeEd25519():
      return stellar.StrKey.encodeEd25519PublicKey(xdr.ed25519());

    case stellar.xdr.SignerKeyType.signerKeyTypePreAuthTx():
      return stellar.StrKey.encodePreAuthTx(xdr.preAuthTx());

    case stellar.xdr.SignerKeyType.signerKeyTypeHashX():
      return stellar.StrKey.encodeSha256Hash(xdr.hashX());
  }
}
