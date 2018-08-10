import stellar from "stellar-base";

export default class AccountThresholds {
  public masterWeight: number;
  public low: number;
  public medium: number;
  public high: number;

  constructor(value: string) {
    const t = Buffer.from(value, "base64");
    const ti = stellar.xdr.ThresholdIndices;

    this.masterWeight = t[ti.thresholdMasterWeight().value];
    this.low = t[ti.thresholdLow().value];
    this.medium = t[ti.thresholdMed().value];
    this.high = t[ti.thresholdHigh().value];
  }
}
