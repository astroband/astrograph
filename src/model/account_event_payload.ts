import { Account } from "./account";
import { IPayloadType, PayloadType } from "./payload_type";
import { Signer } from "./signer";

import { publicKeyFromXDR } from "../common/xdr";

export class AccountEventPayload extends Account implements IPayloadType {
  public static buildFromXDR(payloadType: PayloadType, xdr: any): AccountEventPayload {
    const accountid = publicKeyFromXDR(xdr);

    return new AccountEventPayload(
      payloadType,
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

  public payloadType: PayloadType;
  public signers: Signer[];

  constructor(payloadType: PayloadType, data: any, signers: any[]) {
    super(data);
    this.payloadType = payloadType;
    this.signers = signers;
  }
}
