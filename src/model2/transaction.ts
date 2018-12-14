import stellar from "stellar-base";
import { Memo } from "stellar-sdk";
import { publicKeyFromBuffer } from "../util/xdr";

export interface ITransaction {
  id: string;
  ledgerSeq: number;
  index: number;
  body?: string;
  bodyXDR?: any;
  result?: string;
  resultXDR?: any;
  meta?: string;
  metaXDR?: any;
  feeMeta?: string;
  feeMetaXDR?: any;
  memo: Memo | null = null;
  feeAmount: string;
  sourceAccount: string;
  timeBounds: [number, number] | null = null;
  feeCharged: string;
  success: boolean = false;
  resultCode: number;
}

export interface ITransactionTableRow {
  txid: string;
  ledgerseq: number;
  txindex: number;
  txbody: string;
  txresult: string;
  txmeta: string;
  txfeemeta: string;
}

export class Transaction implements ITransaction {
  public static fromDb(row: ITransactionTableRow): Transaction {
    const data: ITransaction = {
      id: row.txid,
      ledgerSeq: row.ledgerseq,
      index: row.txindex,
      body: row.txbody,
      bodyXDR: stellar.xdr.TransactionEnvelope.fromXDR(Buffer.from(this.body, "base64")),
      result: row.txresult,
      resultXDR: stellar.xdr.TransactionEnvelope.fromXDR(Buffer.from(this.body, "base64")),
      meta: row.txmeta,
      metaXDR: stellar.xdr.TransactionMeta.fromXDR(Buffer.from(this.meta, "base64")),
      feeMeta: row.txfeemeta,
      feeMetaXDR: stellar.xdr.OperationMeta.fromXDR(Buffer.from(this.feeMeta, "base64"))
    };

    const body = data.bodyXDR.tx();
    const result = data.resultXDR.result();

    const memo = Memo.fromXDRObject(body.memo());
    const timeBounds = body.timeBounds();

    if (memo.value) {
      data.memo = memo;
    }

    if (timeBounds) {
      data.timeBounds = [timeBounds.minTime().toInt(), timeBounds.maxTime().toInt()];
    }

    data.result = result.result();
    data.feeAmount = body.fee().toString();
    data.feeCharged = result.feeCharged.toString();
    data.resultCode = result.result().switch().value;
    data.success = data.resultCode === stellar.xdr.TransactionResultCode.txSuccess().value;
    data.sourceAccount = publicKeyFromBuffer(body.sourceAccount().value());
  }

  public id: string;
  public ledgerSeq: number;
  public index: number;
  public body?: string;
  public bodyXDR?: any;
  public result?: string;
  public resultXDR?: any;
  public meta?: string;
  public metaXDR?: any;
  public feeMeta?: string;
  public feeMetaXDR?: any;
  public memo?: Memo;
  public feeAmount: string;
  public sourceAccount: string;
  public timeBounds?: [number, number];
  public feeCharged: string;
  public success: boolean;
  public resultCode: number;

  // public readonly envelopeXDR: any;
  // public readonly resultXDR: any;

  constructor(data: ITransaction) {
    this.id = data.id;
    this.ledgerSeq = data.ledgerSeq;
    this.index = data.index;
    this.body = data.body;
    this.bodyXDR = data.bodyXDR;
    this.result = data.result;
    this.resultXDR = data.resultXDR;
    this.meta = data.meta;
    this.metaXDR = data.metaXDR;
    this.feeMeta = data.feeMeta;
    this.feeMetaXDR = data.feeMetaXDR;
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
