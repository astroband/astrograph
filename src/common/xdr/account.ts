import stellar from "stellar-base";
import { AccountValues } from "../../model";

export function publicKeyFromBuffer(value: Buffer): string {
  return stellar.StrKey.encodeEd25519PublicKey(value);
}

export function publicKeyFromXDR(xdr: any): string {
  return publicKeyFromBuffer(xdr.accountId().value());
}

export function diffAccountsXDR(xdr1: any, xdr2: any): string[] {
  const accountValues1 = AccountValues.buildFromXDR(xdr1);
  const accountValues2 = AccountValues.buildFromXDR(xdr2);

  return accountValues1.diffAttrs(accountValues2);
}
