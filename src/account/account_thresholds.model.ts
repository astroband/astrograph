import stellar from "stellar-base";

export default class AccountThresholds {
  public id: string;
  public masterWeight: number;
  public low: number;
  public medium: number;
  public high: number;

  constructor(value: string) {
    const t = Buffer.from(value, "base64");

    this.masterWeight = t[stellar.xdr.ThresholdIndices.thresholdMasterWeight()];
    this.low = t[stellar.xdr.ThresholdIndices.low()];
    this.medium = t[stellar.xdr.ThresholdIndices.medium()];
    this.high = t[stellar.xdr.ThresholdIndices.high()];
  }
}
