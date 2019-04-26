<<<<<<< HEAD
import { BigNumber } from "bignumber.js";
import { AccountFlags, AccountID, AccountThresholds, Signer } from "./";
=======
import { AccountID, AccountThresholds, Signer } from "./";
>>>>>>> Remove flags from Account

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
  sellingLiabilities: BigNumber;
  buyingLiabilities: BigNumber;
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
  public readonly sellingLiabilities: BigNumber;
  public readonly buyingLiabilities: BigNumber;

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
    this.sellingLiabilities = data.sellingLiabilities;
    this.buyingLiabilities = data.buyingLiabilities;
  }

  public get paging_token() {
    return this.id;
  }
}
