import stellar from "stellar-base";
import { Memo } from "stellar-sdk";
import { publicKeyFromBuffer } from "../util/xdr";
import { ITransaction, TimeBounds, Transaction } from "./transaction";

export interface ITransactionTableRow {
  txid: string;
  ledgerseq: number;
  txindex: number;
  txbody: string;
  txresult: string;
  txmeta: string;
  txfeemeta: string;
}

export interface ICoreTransaction extends ITransaction {
  body: string;
  bodyXDR: any;
  result: string;
  resultXDR: any;
  meta: string;
  metaXDR: any;
  feeMeta: string;
  feeMetaXDR: any;
}

export class CoreTransaction extends Transaction {
  public static fromDb(row: ITransactionTableRow): Transaction {
    const bodyXDR = stellar.xdr.TransactionEnvelope.fromXDR(Buffer.from(row.txbody, "base64"));
    const resultXDR = stellar.xdr.TransactionEnvelope.fromXDR(Buffer.from(row.txresult, "base64"));
    const metaXDR = stellar.xdr.TransactionMeta.fromXDR(Buffer.from(row.txmeta, "base64"));
    const feeMetaXDR = stellar.xdr.OperationMeta.fromXDR(Buffer.from(row.txfeemeta, "base64"));

    const body = bodyXDR.tx();
    const result = resultXDR.result();

    const memo = Memo.fromXDRObject(body.memo());
    const timeBoundsXDR = body.timeBounds();

    const timeBounds: TimeBounds | undefined = timeBoundsXDR
      ? [timeBoundsXDR.minTime().toInt(), timeBoundsXDR.maxTime().toInt()]
      : undefined;

    const resultCode = result.result().switch().value;
    const success = resultCode === stellar.xdr.TransactionResultCode.txSuccess().value;
    const feeAmount = body.fee().toString();
    const feeCharged = result.feeCharged.toString();
    const sourceAccount = publicKeyFromBuffer(body.sourceAccount().value());

    const data: ICoreTransaction = {
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
      timeBounds,
      feeAmount,
      feeCharged,
      resultCode,
      success,
      sourceAccount
    };

    return new Transaction(data);
  }

  public body: string;
  public bodyXDR: any;
  public result: string;
  public resultXDR: any;
  public meta: string;
  public metaXDR: any;
  public feeMeta: string;
  public feeMetaXDR: any;

  constructor(data: ICoreTransaction) {
    super(data);

    this.body = data.body;
    this.bodyXDR = data.bodyXDR;
    this.result = data.result;
    this.resultXDR = data.resultXDR;
    this.meta = data.meta;
    this.metaXDR = data.metaXDR;
    this.feeMeta = data.feeMeta;
    this.feeMetaXDR = data.feeMetaXDR;
  }
}
