export interface IAccountThresholds {
  masterWeight: number;
  low: number;
  medium: number;
  high: number;
}

export class AccountThresholds implements IAccountThresholds {
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
