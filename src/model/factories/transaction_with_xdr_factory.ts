import stellar from "stellar-base";
import { Memo } from "stellar-sdk";
import { publicKeyFromBuffer } from "../../util/xdr";
import { ITimeBounds } from "../transaction";
import { ITransactionWithXDR, TransactionWithXDR } from "../transaction_with_xdr";

export interface ITransactionTableRow {
  txid: string;
  ledgerseq: number;
  txindex: number;
  txbody: string;
  txresult: string;
  txmeta: string;
  txfeemeta: string;
}

// NOTE: Might use some instantiation from static method here
export class TransactionWithXDRFactory {
  public static fromDb(row: ITransactionTableRow): TransactionWithXDR {
    const bodyXDR = stellar.xdr.TransactionEnvelope.fromXDR(row.txbody, "base64");
    const resultXDR = stellar.xdr.TransactionResultPair.fromXDR(row.txresult, "base64");
    const metaXDR = stellar.xdr.TransactionMeta.fromXDR(row.txmeta, "base64");
    const feeMetaXDR = stellar.xdr.OperationMeta.fromXDR(row.txfeemeta, "base64");

    const body = bodyXDR.tx();
    const result = resultXDR.result();

    const memo = Memo.fromXDRObject(body.memo());

    const timeBounds = this.parseTimeBounds(body.timeBounds());

    const resultCode = result.result().switch().value;
    const success = resultCode === stellar.xdr.TransactionResultCode.txSuccess().value;
    const feeAmount = body.fee().toString();
    const feeCharged = result.feeCharged().toString();
    const sourceAccount = publicKeyFromBuffer(body.sourceAccount().value());

    const data: ITransactionWithXDR = {
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
      sourceAccount,
      operationsXDR: body.operations(),
      operationResultsXDR: result.result().results()
    };

    return new TransactionWithXDR(data);
  }

  public static parseTimeBounds(timeBoundsXDR: any): ITimeBounds | undefined {
    if (!timeBoundsXDR) {
      return;
    }

    const minTime: Date = new Date(timeBoundsXDR.minTime().toInt() * 1000);
    // maxTime equal 0 means that it's not set
    const maxTime = timeBoundsXDR.maxTime().toInt() !== 0 ? new Date(timeBoundsXDR.maxTime() * 1000) : undefined;

    return { minTime, maxTime };
  }
}
