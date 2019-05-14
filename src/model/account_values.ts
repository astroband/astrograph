import { AccountID, AccountFlags, AccountThresholds } from "./";
import { Signer } from "./signer";

export interface IAccountValues {
  id: AccountID;
  balance: string;
  sequenceNumber: string;
  numSubentries: number;
  inflationDestination: AccountID;
  homeDomain: string;
  thresholds: AccountThresholds;
  flags: AccountFlags;
  signers: Signer[];
}

export class AccountValues implements IAccountValues {
  public id: string;
  public balance: string;
  public sequenceNumber: string;
  public numSubentries: number;
  public inflationDestination: string;
  public homeDomain: string;
  public thresholds: AccountThresholds;
  public flags: AccountFlags;
  public signers: Signer[];

  constructor(data: IAccountValues) {
    this.id = data.id;
    this.balance = data.balance;
    this.sequenceNumber = data.sequenceNumber;
    this.numSubentries = data.numSubentries;
    this.inflationDestination = data.inflationDestination;
    this.homeDomain = data.homeDomain;
    this.thresholds = data.thresholds;
    this.flags = data.flags;

    this.signers = Signer.sortArray(data.signers);
  }

  public diffAttrs(other: AccountValues): string[] {
    if (this.id !== other.id) {
      throw new Error("Cannot compare AccountValues for different accounts");
    }

    const changedAttrs: string[] = [];

    const easyToCompareAttrs = ["balance", "sequenceNumber", "numSubentries", "inflationDestination", "homeDomain"];

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
