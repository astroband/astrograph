import { StrKey, xdr } from "stellar-base";

export function signerKeyFromXDR(input: xdr.SignerKey): string {
  switch (input.switch()) {
    case xdr.SignerKeyType.signerKeyTypeEd25519():
      return StrKey.encodeEd25519PublicKey(input.ed25519());

    case xdr.SignerKeyType.signerKeyTypePreAuthTx():
      return StrKey.encodePreAuthTx(input.preAuthTx());

    case xdr.SignerKeyType.signerKeyTypeHashX():
      return StrKey.encodeSha256Hash(input.hashX());

    case xdr.SignerKeyType.signerKeyTypeEd25519SignedPayload():
      return StrKey.encodeSignedPayload(input.ed25519SignedPayload().payload());

    default:
      throw new Error("invalid SignerKey");
  }
}
