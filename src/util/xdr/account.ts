import stellar from "stellar-base";
import { AccountValuesFactory } from "../../model2/factories";

export function publicKeyFromBuffer(value: Buffer): string {
  return stellar.StrKey.encodeEd25519PublicKey(value);
}

export function publicKeyFromXDR(xdr: any): string {
  return publicKeyFromBuffer(xdr.accountId().value());
}

export function diffAccountsXDR(xdr1: any, xdr2: any): string[] {
  const accountValues1 = AccountValuesFactory.fromXDR(xdr1);
  const accountValues2 = AccountValuesFactory.fromXDR(xdr2);

  return accountValues1.diffAttrs(accountValues2);
}
