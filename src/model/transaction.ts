import { Memo } from "stellar-sdk";

export interface ITimeBounds {
  readonly minTime: Date;
  readonly maxTime?: Date;
}

export interface ITransaction {
  id: string;
  index?: number;
  ledgerSeq: number;
  memo?: Memo;
  feeAmount: string;
  sourceAccount: string;
  timeBounds?: ITimeBounds;
  feeCharged: string;
  success: boolean;
  resultCode: number;
}

export class Transaction implements ITransaction {
  public id: string;
  public index?: number;
  public ledgerSeq: number;
  public memo?: Memo;
  public feeAmount: string;
  public sourceAccount: string;
  public timeBounds?: ITimeBounds;
  public feeCharged: string;
  public success: boolean;
  public resultCode: number;

  constructor(data: ITransaction) {
    this.id = data.id;
    this.index = data.index;
    this.ledgerSeq = data.ledgerSeq;
    this.memo = data.memo;
    this.feeAmount = data.feeAmount;
    this.sourceAccount = data.sourceAccount;
    this.timeBounds = data.timeBounds;
    this.feeCharged = data.feeCharged;
    this.success = data.success;
    this.resultCode = data.resultCode;
  }
}
