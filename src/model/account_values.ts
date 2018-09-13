import { Account } from "./account";
import { AccountThresholds } from "./account_thresholds";
import { Signer } from "./signer";

import { publicKeyFromXDR } from "../common/xdr";

export class AccountValues extends Account {
  public static buildFromXDR(xdr: any): AccountValues {
    const accountid = publicKeyFromXDR(xdr);
    const signers = xdr.signers().map((s: any) => Signer.buildFromXDR(s, accountid));
    const thresholds = new AccountThresholds(xdr.thresholds());

    signers.unshift(
      new Signer({
        accountid,
        publickey: accountid,
        weight: thresholds.masterWeight
      })
    );

    return new AccountValues(
      {
        accountid,
        balance: xdr.balance().toString(),
        seqnum: xdr.seqNum().toString(),
        numsubentries: xdr.numSubEntries(),
        inflationdest: xdr.inflationDest() || null,
        homedomain: xdr.homeDomain(),
        thresholds: xdr.thresholds(),
        flags: xdr.flags(),
        lastmodified: -1
      },
      signers
    );
  }

  public signers: Signer[];

  constructor(
    data: {
      accountid: string;
      balance: string;
      seqnum: string;
      numsubentries: number;
      inflationdest: string;
      homedomain: string;
      thresholds: string;
      flags: number;
      lastmodified: number;
    },
    signers: any[]
  ) {
    super(data);
    this.signers = signers.sort((s1, s2) => {
      if (s1.signer < s2.signer) {
        return -1;
      } else if (s1.signer === s2.signer) {
        return 0;
      } else {
        return 1;
      }
    });
  }

  public diffAttrs(other: AccountValues): string[] {
    if (this.id !== other.id) {
      throw new Error("Cannot compare AccountValues for different accounts");
    }

    const changedAttrs: string[] = [];

    const easyToCompareAttrs = ["balance", "seqNum", "numSubEntries", "inflationDest", "homeDomain"];

    for (const attr of easyToCompareAttrs) {
      if (this[attr] !== other[attr]) {
        changedAttrs.push(attr);
      }
    }

    if (!this.flags.equals(other.flags)) {
      changedAttrs.push("flags");
    }

    if (!this.thresholds.equals(other.thresholds)) {
      changedAttrs.push("thresholds");
    }

    if (this.signers.length !== other.signers.length) {
      changedAttrs.push("signers");
    } else {
      const allSignersAreEqual = this.signers.every((s: Signer, i: number) => {
        return s.signer === other.signers[i].signer && s.weight === other.signers[i].weight;
      });

      if (!allSignersAreEqual) {
        changedAttrs.push("signers");
      }
    }

    return changedAttrs;
  }
}
