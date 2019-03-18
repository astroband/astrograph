import { AccountFlags, AccountThresholds, Signer } from "./";

export interface IAccountBase {
  id: string;
  balance: string;
  sequenceNumber: string;
  numSubentries: number;
  inflationDest: string;
  homeDomain: string;
  thresholds: AccountThresholds;
  flags: AccountFlags;
  signers?: Signer[];
}

export interface IAccount extends IAccountBase {
  lastModified: number;
}

export class Account implements IAccount {
  public id: string;
  public balance: string;
  public sequenceNumber: string;
  public numSubentries: number;
  public inflationDest: string;
  public homeDomain: string;
  public thresholds: AccountThresholds;
  public flags: AccountFlags;
  public lastModified: number;
  public signers?: Signer[];

  constructor(data: IAccount) {
    this.id = data.id;
    this.balance = data.balance;
    this.sequenceNumber = data.sequenceNumber;
    this.numSubentries = data.numSubentries;
    this.inflationDest = data.inflationDest;
    this.homeDomain = data.homeDomain;
    this.lastModified = data.lastModified;
    this.thresholds = data.thresholds;
    this.flags = data.flags;
    this.signers = data.signers;
  }
}
