import { BigNumber } from "bignumber.js";
import { VarArray } from "js-xdr";
import { xdr } from "stellar-base";
import { Account, IAccount } from "../account";
import { AccountFlagsFactory, AccountThresholdsFactory, SignerFactory } from "./";

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
  sellingliabilities: string;
  buyingliabilities: string;
  signers: string | null;
}

export class AccountFactory {
  public static fromDb(row: IAccountTableRow): Account {
    const data: IAccount = {
      id: row.accountid,
      balance: row.balance,
      sequenceNumber: row.seqnum,
      numSubentries: row.numsubentries,
      inflationDestination: row.inflationdest,
      homeDomain: row.homedomain,
      lastModified: row.lastmodified,
      thresholds: AccountThresholdsFactory.fromValue(row.thresholds),
      flags: AccountFlagsFactory.fromValue(row.flags),
      sellingLiabilities: new BigNumber(row.sellingliabilities),
      buyingLiabilities: new BigNumber(row.buyingliabilities)
    };

    if (row.signers) {
      const signersArray = new VarArray(xdr.Signer).fromXDR(row.signers, "base64");
      data.signers = signersArray.map((signerXDR: any) => SignerFactory.fromXDR(signerXDR, row.accountid));
    }

    return new Account(data);
  }
}
