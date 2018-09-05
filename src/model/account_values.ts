import { Account } from "./account";
import { Signer } from "./signer";

import { publicKeyFromXDR } from "../common/xdr";

export class AccountValues extends Account {
  public static buildFromXDR(xdr: any): AccountValues {
    const accountid = publicKeyFromXDR(xdr);

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
      xdr.signers().map((s: any) => Signer.buildFromXDR(s, accountid))
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
