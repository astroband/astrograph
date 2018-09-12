import stellar from "stellar-base";
import { signerKeyFromXDR } from ".";

export function publicKeyFromBuffer(value: Buffer): string {
  return stellar.StrKey.encodeEd25519PublicKey(value);
}

export function publicKeyFromXDR(xdr: any): string {
  return publicKeyFromBuffer(xdr.accountId().value());
}

export function diffAccountsXDR(xdr1: any, xdr2: any): string[] {
  const changedAttrs: string[] = [];

  const easyToCompareAttrs = [
    "numSubEntries",
    "inflationDest",
    "flags",
    "homeDomain"
  ];

  for (const attr of easyToCompareAttrs) {
    if (xdr1[attr]() !== xdr2[attr]()) {
      changedAttrs.push(attr);
    }
  }

  if (xdr1.balance().toString() !== xdr2.balance().toString()) {
    changedAttrs.push("balance");
  }

  if (xdr1.seqNum().toString() !== xdr2.seqNum().toString()) {
    changedAttrs.push("seqNum");
  }

  if (!xdr1.thresholds().equals(xdr2.thresholds())) {
    changedAttrs.push("thresholds");
  }

  if (xdr1.signers().length !== xdr2.signers().length) {
    changedAttrs.push("signers");
  } else {
    const allSignersAreEqual =
      xdr1
      .signers()
      .map((signerXDR: any, i: number) => { return [signerXDR, xdr2.signers()[i]] })
      .reduce((accumulator: boolean, pair: any[]) => {
        return accumulator &&
          signerKeyFromXDR(pair[0].key()) === signerKeyFromXDR(pair[1].key()) &&
          pair[0].weight() === pair[1].weight()
      }, true);

    if (!allSignersAreEqual) {
      changedAttrs.push("signers");
    }
  }

  return changedAttrs;
}
