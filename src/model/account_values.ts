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
    this.signers = signers;
  }
}
