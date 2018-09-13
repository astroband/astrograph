import stellar from "stellar-base";

export class AccountThresholds {
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

  public equals(other: AccountThresholds): boolean {
    return (
      this.low === other.low &&
      this.medium === other.medium &&
      this.high === other.high &&
      this.masterWeight === other.masterWeight
    );
  }
}
