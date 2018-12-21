import stellar from "stellar-base";
import { Memo } from "stellar-sdk";
import { publicKeyFromBuffer } from "../../util/xdr";
import { TimeBounds } from "../transaction";
import { ITransactionWithXDR, TransactionWithXDR } from "../transaction_with_xdr";
import { ITransactionTableRow } from "./transaction_factory";

// NOTE: Might use some instantiation from static method here
export class TransactionWithXDRFactory {
  public static fromDb(row: ITransactionTableRow): TransactionWithXDR {
    const bodyXDR = stellar.xdr.TransactionEnvelope.fromXDR(Buffer.from(row.txbody, "base64"));
    const resultXDR = stellar.xdr.TransactionResultPair.fromXDR(Buffer.from(row.txresult, "base64"));
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
}
