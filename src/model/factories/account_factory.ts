import { BigNumber } from "bignumber.js";
import { VarArray } from "js-xdr";
import { xdr } from "stellar-base";
import { Account, IAccount } from "../account";
import { AccountFlagsFactory, AccountThresholdsFactory, SignerFactory } from "./";
import { Account as AccountEntity } from "../../orm/entities/account";

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
  public static fromDb(row: AccountEntity): Account {
    const data: IAccount = {
      id: row.id,
      balance: row.balance,
      sequenceNumber: row.sequenceNumber,
      numSubentries: row.numSubentries,
      inflationDestination: row.inflationDestination,
      homeDomain: row.homeDomain,
      lastModified: row.lastModified,
      thresholds: AccountThresholdsFactory.fromValue(row.thresholds),
      sellingLiabilities: new BigNumber(row.sellingliabilities),
      buyingLiabilities: new BigNumber(row.buyingliabilities)
    };

    if (row.signers) {
      const signersArray = new VarArray(xdr.Signer).fromXDR(row.signers, "base64");
      data.signers = signersArray.map((signerXDR: any) => SignerFactory.fromXDR(signerXDR, row.id));
    }

    return new Account(data);
  }
}
