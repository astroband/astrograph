import stellar from "stellar-base";

export function publicKeyFromBuffer(value: Buffer): string {
  return stellar.StrKey.encodeEd25519PublicKey(value);
}

export function publicKeyFromXDR(xdr: any): string {
  return publicKeyFromBuffer(xdr.accountId().value());
}

export function arePublicKeysEqual(xdr1: any, xdr2: any): boolean {
  return publicKeyFromXDR(xdr1) === publicKeyFromXDR(xdr2);
}
