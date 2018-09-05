import { Account } from "./account";
import { IMutationType, MutationType } from "./mutation_type";
import { Signer } from "./signer";

import { publicKeyFromXDR } from "../common/xdr";

export class AccountEventPayload extends Account implements IMutationType {
  public static buildFromXDR(mutationType: MutationType, xdr: any): AccountEventPayload {
    const accountid = publicKeyFromXDR(xdr);

    return new AccountEventPayload(
      mutationType,
      {
        accountid,
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

  public mutationType: MutationType;
  public signers: Signer[];

  constructor(mutationType: MutationType, data: any, signers: any[]) {
    super(data);
    this.mutationType = mutationType;
    this.signers = signers;
  }
}
