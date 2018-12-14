import { Memo } from "stellar-sdk";

export type TimeBounds = [number, number];

export interface ITransaction {
  id: string;
  ledgerSeq: number;
  index: number;
  memo?: Memo;
  feeAmount: string;
  sourceAccount: string;
  timeBounds?: TimeBounds;
  feeCharged: string;
  success: boolean;
  resultCode: number;
}

export class Transaction implements ITransaction {
  public id: string;
  public ledgerSeq: number;
  public index: number;
  public memo?: Memo;
  public feeAmount: string;
  public sourceAccount: string;
  public timeBounds?: TimeBounds;
  public feeCharged: string;
  public success: boolean;
  public resultCode: number;

  constructor(data: ITransaction) {
    this.id = data.id;
    this.ledgerSeq = data.ledgerSeq;
    this.index = data.index;
    this.memo = data.memo;
    this.feeAmount = data.feeAmount;
    this.sourceAccount = data.sourceAccount;
    this.timeBounds = data.timeBounds;
    this.feeCharged = data.feeCharged;
    this.success = data.success;
    this.resultCode = data.resultCode;
  }

  // public operationsXDR(): any {
  //   return this.envelopeXDR.tx().operations();
  // }
  //
  // public operationResultsXDR(): any {
  //   return this.resultXDR
  //     .result()
  //     .result()
  //     .results();
  // }
}
