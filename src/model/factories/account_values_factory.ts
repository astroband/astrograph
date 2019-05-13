import { AccountThresholdsFactory, SignerFactory } from "./";

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
      signers
    };

    return new AccountValues(data);
  }
}
