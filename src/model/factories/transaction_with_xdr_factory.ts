import BigNumber from "bignumber.js";
import stellar from "stellar-base";
import { Memo } from "stellar-sdk";
import { IHorizonTransactionData } from "../../datasource/types";
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
      index: row.txindex,
      ledgerSeq: row.ledgerseq,
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

  public static fromHorizon(data: IHorizonTransactionData): TransactionWithXDR {
    const bodyXDR = stellar.xdr.TransactionEnvelope.fromXDR(data.envelope_xdr, "base64");
    const result = stellar.xdr.TransactionResult.fromXDR(data.result_xdr, "base64");
    const metaXDR = stellar.xdr.TransactionMeta.fromXDR(data.result_meta_xdr, "base64");
    const feeMetaXDR = stellar.xdr.OperationMeta.fromXDR(data.fee_meta_xdr, "base64");

    const body = bodyXDR.tx();

    const memo = Memo.fromXDRObject(body.memo());

    const timeBounds = this.parseTimeBounds(body.timeBounds());

    const resultCode = result.result().switch().value;
    const success = resultCode === stellar.xdr.TransactionResultCode.txSuccess().value;
    const feeAmount = body.fee().toString();
    const feeCharged = result.feeCharged().toString();
    const sourceAccount = publicKeyFromBuffer(body.sourceAccount().value());

    return new TransactionWithXDR({
      id: data.id,
      index: this.extractTxIndex(data.paging_token),
      ledgerSeq: data.ledger,
      body: data.envelope_xdr,
      bodyXDR,
      result: data.result_xdr,
      resultXDR: result,
      meta: data.result_meta_xdr,
      metaXDR,
      feeMeta: data.fee_meta_xdr,
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
    });
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

  // Parses paging token, returned by Horizon, and returns an index
  // of transaction in ledger
  // Source: https://github.com/stellar/go/blob/master/services/horizon/internal/toid/main.go
  // Note: this is a hack, because paging token ought to be opaque,
  // but for now we ok with it
  private static extractTxIndex(pagingToken: string): number {
    const binaryToken = new BigNumber(pagingToken).toString(2).padStart(64, "0");
    return parseInt(binaryToken.slice(32, 52), 2);
  }
}
