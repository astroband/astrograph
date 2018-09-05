import { AccountFlags } from "./account_flags";
import { AccountThresholds } from "./account_thresholds";

export class Account {
  public id: string;
  public balance: string;
  public sequenceNumber: string;
  public numSubentries: number;
  public inflationDest: string;
  public homeDomain: string;
  public thresholds: AccountThresholds;
  public flags: AccountFlags;
  public lastModified: number;

  constructor(data: {
    accountid: string;
    balance: string;
    seqnum: string;
    numsubentries: number;
    inflationdest: string;
    homedomain: string;
    thresholds: string;
    flags: number;
    lastmodified: number;
  }) {
    this.id = data.accountid;
    this.balance = data.balance;
    this.sequenceNumber = data.seqnum;
    this.numSubentries = data.numsubentries;
    this.inflationDest = data.inflationdest;
    this.homeDomain = data.homedomain;
    this.lastModified = data.lastmodified;

    this.thresholds = new AccountThresholds(data.thresholds);
    this.flags = new AccountFlags(data.flags);
  }
}
