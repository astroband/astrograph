import stellar from "stellar-base";

export interface IAccountThresholds {
  masterWeight: number;
  low: number;
  medium: number;
  high: number;
}

export class AccountThresholds implements IAccountThresholds {
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

  public masterWeight: number;
  public low: number;
  public medium: number;
  public high: number;

  constructor(data: IAccountThresholds) {
    this.masterWeight = data.masterWeight;
    this.low = data.low;
    this.medium = data.medium;
    this.high = data.high;
  }

  public equals(other: IAccountThresholds): boolean {
    return (
      this.low === other.low &&
      this.medium === other.medium &&
      this.high === other.high &&
      this.masterWeight === other.masterWeight
    );
  }
}
