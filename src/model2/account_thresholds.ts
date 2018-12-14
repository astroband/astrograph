import stellar from "stellar-base";

export interface IAccountThresholds {
  masterWeight: number;
  low: number;
  medium: number;
  high: number;
}

export class AccountThresholds implements IAccountThresholds {
  public static fromValue(value: number): AccountThresholds {
    const fl = stellar.xdr.AccountFlags;

    const data: IAccountThresholds = {
      authRequired: (value & fl.authRequiredFlag().value) > 0,
      authRevokable: (value & fl.authRevocableFlag().value) > 0,
      authImmutable: (value & fl.authImmutableFlag().value) > 0
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
