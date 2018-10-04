import stellar from "stellar-base";
import { publicKeyFromBuffer } from "../util/xdr";

type MemoValue = string | number;
enum MemoType {
  Id = "ID",
  Text = "TEXT",
  Hash = "HASH",
  Return = "RETURN"
}

export class Transaction {
  public id: string;
  public ledgerSeq: number;
  public index: number;
  public body: string;
  public result: string;
  public meta: string;
  public feeMeta: string;
  public memo: { value: MemoValue; type: MemoType } | null = null;
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

    this.memo = this.extractMemo(txBody);
    this.feeAmount = txBody.fee();
    this.sourceAccount = publicKeyFromBuffer(txBody.sourceAccount().value());

    const timeBounds = txBody.timeBounds();

    if (timeBounds) {
      this.timeBounds = [timeBounds.minTime().toInt(), timeBounds.maxTime().toInt()];
    }
  }

  public metaFromXDR() {
    return stellar.xdr.TransactionMeta.fromXDR(Buffer.from(this.meta, "base64"));
  }

  public feeMetaFromXDR() {
    return stellar.xdr.OperationMeta.fromXDR(Buffer.from(this.feeMeta, "base64"));
  }

  private extractMemo(txBody: any): { value: MemoValue; type: MemoType } | null {
    const memoType = stellar.xdr.MemoType;
    const memoValue = txBody.memo().value();

    switch (txBody.memo().switch()) {
      case memoType.memoNone():
        return null;
      case memoType.memoId():
        return { value: parseInt(memoValue, 10), type: MemoType.Id };
      case memoType.memoText():
        return { value: memoValue, type: MemoType.Text };
      case memoType.memoHash():
        return { value: memoValue.toString("utf8"), type: MemoType.Hash };
      case memoType.memoReturn():
        return { value: memoValue.toString("utf8"), type: MemoType.Return };
      default:
        return null;
    }
  }
}
