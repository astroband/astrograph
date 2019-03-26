import { AccountFlagsFactory } from "./account_flags_factory";
import { AccountThresholdsFactory } from "./account_thresholds_factory";
import { SignerFactory } from "./signer_factory";

import { AccountValues, IAccountValues } from "../";

import { publicKeyFromXDR } from "../../util/xdr";

export class AccountValuesFactory {
  public static fromXDR(xdr: any): AccountValues {
    const id = publicKeyFromXDR(xdr);
    const signers = xdr.signers().map((s: any) => SignerFactory.fromXDR(s, id));
    const thresholds = AccountThresholdsFactory.fromValue(xdr.thresholds());

    signers.unshift(SignerFactory.self(id, thresholds.masterWeight));

    const data: IAccountValues = {
      id,
      balance: xdr.balance().toString(),
      sequenceNumber: xdr.seqNum().toString(),
      numSubentries: xdr.numSubEntries(),
      inflationDestination: xdr.inflationDest() || null,
      homeDomain: xdr.homeDomain(),
      thresholds,
      flags: AccountFlagsFactory.fromValue(xdr.flags()),
      signers
    };

    return new AccountValues(data);
  }
}
