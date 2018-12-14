import stellar from "stellar-base";
import { AccountThresholds, IAccountThresholds } from "..";

export class AccountThresholdsFactory {
  public static fromValue(value: string): AccountThresholds {
    const t = Buffer.from(value, "base64");
    const ti = stellar.xdr.ThresholdIndices;

    const data: IAccountThresholds = {
      masterWeight: t[ti.thresholdMasterWeight().value],
      low: t[ti.thresholdLow().value],
      medium: t[ti.thresholdMed().value],
      high: t[ti.thresholdHigh().value]
    };

    return new AccountThresholds(data);
  }
}
