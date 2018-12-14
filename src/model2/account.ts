import { AccountFlags, AccountFlagsFactory, AccountThresholds } from "./index";

export interface IAccountBase {
  id: string;
  balance: string;
  sequenceNumber: string;
  numSubentries: number;
  inflationDest: string;
  homeDomain: string;
  thresholds: AccountThresholds;
  flags: AccountFlags;
}

export interface IAccount extends IAccountBase {
  lastModified: number;
}

export interface IAccountTableRow {
  accountid: string;
  balance: string;
  seqnum: string;
  numsubentries: number;
  inflationdest: string;
  homedomain: string;
  thresholds: string;
  flags: number;
  lastmodified: number;
}

export class Account implements IAccount {
  public static fromDb(row: IAccountTableRow): Account {
    const data: IAccount = {
      id: row.accountid,
      balance: row.balance,
      sequenceNumber: row.seqnum,
      numSubentries: row.numsubentries,
      inflationDest: row.inflationdest,
      homeDomain: row.homedomain,
      lastModified: row.lastmodified,
      thresholds: AccountThresholds.fromValue(row.thresholds),
      flags: AccountFlagsFactory.fromValue(row.flags)
    };

    return new Account(data);
  }

  public id: string;
  public balance: string;
  public sequenceNumber: string;
  public numSubentries: number;
  public inflationDest: string;
  public homeDomain: string;
  public thresholds: AccountThresholds;
  public flags: AccountFlags;
  public lastModified: number;

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
  }
}
