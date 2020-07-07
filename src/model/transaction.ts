import stellar from "stellar-base";
import { AccountID } from "./";

export interface ITimeBounds {
  minTime: Date;
  maxTime?: Date;
}

export interface ITransaction {
  id: string;
  index: number;
  ledgerSeq: number;
  memo?: stellar.Memo;
  feeAmount: string;
  sourceAccount: AccountID;
  feeAccount?: AccountID;
  timeBounds?: ITimeBounds;
  feeCharged: number;
  success: boolean;
  resultCode: number;
}

export class Transaction implements ITransaction {
  public id: string;
  public index: number;
  public ledgerSeq: number;
  public memo?: stellar.Memo;
  public feeAmount: string;
  public sourceAccount: AccountID;
  public feeAccount?: AccountID;
  public timeBounds?: ITimeBounds;
  public feeCharged: number;
  public success: boolean;
  public resultCode: number;

  constructor(data: ITransaction) {
    this.id = data.id;
    this.index = data.index;
    this.ledgerSeq = data.ledgerSeq;
    this.memo = data.memo;
    this.feeAmount = data.feeAmount;
    this.sourceAccount = data.sourceAccount;
    this.feeAccount = data.feeAccount;
    this.timeBounds = data.timeBounds;
    this.feeCharged = data.feeCharged;
    this.success = data.success;
    this.resultCode = data.resultCode;
  }

  public get paging_token() {
    return this.ledgerSeq * 100 + this.index;
  }
}
