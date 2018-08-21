import { Account } from "./account";
import { EntryType, IEntryType } from "./entry_type";
import { Signer } from "./signer";

import { publicKeyFromXDR } from "../common/xdr";

export class AccountEntry extends Account implements IEntryType {
  public static buildFromXDR(entryType: EntryType, xdr: any): AccountEntry {
    const accountid = publicKeyFromXDR(xdr);

    return new AccountEntry(
      entryType,
      {
        accountid: accountid,
        balance: xdr.balance().toString(),
        seqnum: xdr.seqNum().toString(),
        numsubentries: xdr.numSubEntries(),
        inflationdest: xdr.inflationDest() || null,
        homedomain: xdr.homeDomain(),
        thresholds: xdr.thresholds(),
        flags: xdr.flags()
      },
      xdr.signers().map((s: any) => Signer.buildFromXDR(s, accountid))
    );
  }

  public entryType: EntryType;
  public signers: Signer[];

  constructor(entryType: EntryType, data: any, signers: any[]) {
    super(data);
    this.entryType = entryType;
    this.signers = signers;
  }
}
