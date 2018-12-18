import { Account, IAccount } from "../account";
import { AccountFlagsFactory } from "./account_flags_factory";
import { AccountThresholdsFactory } from "./account_thresholds_factory";

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

export class AccountFactory {
  public static fromDb(row: IAccountTableRow): Account {
    const data: IAccount = {
      id: row.accountid,
      balance: row.balance,
      sequenceNumber: row.seqnum,
      numSubentries: row.numsubentries,
      inflationDest: row.inflationdest,
      homeDomain: row.homedomain,
      lastModified: row.lastmodified,
      thresholds: AccountThresholdsFactory.fromValue(row.thresholds),
      flags: AccountFlagsFactory.fromValue(row.flags)
    };

    return new Account(data);
  }
}
