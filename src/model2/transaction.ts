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
  memo?: Memo;
  feeAmount: string;
  sourceAccount: string;
  timeBounds?: [number, number];
  feeCharged: string;
  success: boolean;
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
    const bodyXDR = stellar.xdr.TransactionEnvelope.fromXDR(Buffer.from(row.txbody, "base64"));
    const resultXDR = stellar.xdr.TransactionEnvelope.fromXDR(Buffer.from(row.txresult, "base64"));
    const metaXDR = stellar.xdr.TransactionMeta.fromXDR(Buffer.from(row.txmeta, "base64"));
    const feeMetaXDR = stellar.xdr.OperationMeta.fromXDR(Buffer.from(row.txfeemeta, "base64"));

    const body = bodyXDR.tx();
    const result = resultXDR.result();

    const memo = Memo.fromXDRObject(body.memo());
    const timeBoundsXDR = body.timeBounds();
    const resultCode = result.result().switch().value;

    const data: ITransaction = {
      id: row.txid,
      ledgerSeq: row.ledgerseq,
      index: row.txindex,
      body: row.txbody,
      bodyXDR,
      result: row.txresult,
      resultXDR,
      meta: row.txmeta,
      metaXDR,
      feeMeta: row.txfeemeta,
      feeMetaXDR,
      memo: memo.value ? memo : undefined,
      timeBounds: timeBoundsXDR ? [timeBoundsXDR.minTime().toInt(), timeBoundsXDR.maxTime().toInt()] : undefined,
      feeAmount: body.fee().toString(),
      feeCharged: result.feeCharged.toString(),
      resultCode,
      success: resultCode === stellar.xdr.TransactionResultCode.txSuccess().value,
      sourceAccount: publicKeyFromBuffer(body.sourceAccount().value())
    };

    return new Transaction(data);
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
