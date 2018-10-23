import stellar from "stellar-base";
import { publicKeyFromBuffer } from "../util/xdr";
import { TransactionMemo } from "./transaction_memo";

export class Transaction {
  public id: string;
  public ledgerSeq: number;
  public index: number;
  public body: string;
  public result: string;
  public meta: string;
  public feeMeta: string;
  public memo: TransactionMemo | null = null;
  public feeAmount: string;
  public sourceAccount: string;
  public timeBounds: [number, number] | null = null;

  public envelopeXDR: any;

  constructor(data: {
    txid: string;
    ledgerseq: number;
    txindex: number;
    txbody: string;
    txresult: string;
    txmeta: string;
    txfeemeta: string;
  }) {
    this.id = data.txid;
    this.ledgerSeq = data.ledgerseq;
    this.index = data.txindex;

    this.body = data.txbody;

    this.result = data.txresult;
    this.meta = data.txmeta;
    this.feeMeta = data.txfeemeta;

    this.envelopeXDR = stellar.xdr.TransactionEnvelope.fromXDR(Buffer.from(this.body, "base64"));

    const txBody = this.envelopeXDR.tx();

    const memo = new TransactionMemo(txBody.memo());

    if (memo.value !== null) {
      this.memo = memo;
    }

    this.feeAmount = txBody.fee();
    this.sourceAccount = publicKeyFromBuffer(txBody.sourceAccount().value());

    const timeBounds = txBody.timeBounds();

    if (timeBounds) {
      this.timeBounds = [timeBounds.minTime().toInt(), timeBounds.maxTime().toInt()];
    }
  }

  public operationsXDR(): any {
    return this.envelopeXDR.tx().operations();
  }

  public metaFromXDR(): any {
    return stellar.xdr.TransactionMeta.fromXDR(Buffer.from(this.meta, "base64"));
  }

  public feeMetaFromXDR(): any {
    return stellar.xdr.OperationMeta.fromXDR(Buffer.from(this.feeMeta, "base64"));
  }
}
