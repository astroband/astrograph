import { AccountID, AccountThresholds, Signer } from "./";

export interface IAccountBase {
  id: string;
  balance: string;
  sequenceNumber: string;
  numSubentries: number;
  inflationDestination: AccountID;
  homeDomain: string;
  thresholds: AccountThresholds;
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
  public inflationDestination: AccountID;
  public homeDomain: string;
  public thresholds: AccountThresholds;
  public lastModified: number;
  public signers?: Signer[];

  constructor(data: IAccount) {
    this.id = data.id;
    this.balance = data.balance;
    this.sequenceNumber = data.sequenceNumber;
    this.numSubentries = data.numSubentries;
    this.inflationDestination = data.inflationDestination;
    this.homeDomain = data.homeDomain;
    this.lastModified = data.lastModified;
    this.thresholds = data.thresholds;
    this.signers = data.signers;
  }
}
