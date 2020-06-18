import stellar from "stellar-base";
import { ITransactionData as IStorageTransactionData } from "../../storage/types";
import { publicKeyFromBuffer } from "../../util/xdr";
import { ITimeBounds, Transaction } from "../transaction";
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

    let body: any;
    let sourceAccount: string;

    switch(bodyXDR.switch()) {
      case stellar.xdr.EnvelopeType.envelopeTypeTxV0():
        body = bodyXDR.v0().tx();
        sourceAccount = publicKeyFromBuffer(body.sourceAccountEd25519());
        break;
      case stellar.xdr.EnvelopeType.envelopeTypeTx():
        body = bodyXDR.v1().tx();
        sourceAccount = stellar.encodeMuxedAccountToAddres(body.sourceAccount());
        break;
      case stellar.xdr.EnvelopeType.envelopeTypeTxFeeBump():
        body = bodyXDR.feeBump().innerTx().tx();
        sourceAccount = stellar.encodeMuxedAccountToAddres(body.feeSource());
        break;
      default:
        throw `Unknown envelope type ${bodyXDR.switch()}`;
    }

    const result = resultXDR.result();

    const memo = stellar.Memo.fromXDRObject(body.memo());

    const timeBounds = this.parseTimeBounds(body.timeBounds());

    const resultCode = result.result().switch().value;
    const success = resultCode === stellar.xdr.TransactionResultCode.txSuccess().value;
    const feeAmount = body.fee().toString();
    const feeCharged = result.feeCharged().toString();

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

  public static fromStorage(data: IStorageTransactionData): Transaction {
    let timeBounds: ITimeBounds | undefined;

    if (data.time_bounds) {
      timeBounds = { minTime: new Date(data.time_bounds.min_time * 1000) };

      if (data.time_bounds.max_time) {
        timeBounds.maxTime = new Date(data.time_bounds.max_time * 1000);
      }
    }

    return new Transaction({
      id: data.id,
      index: data.idx,
      ledgerSeq: data.seq,
      memo: data.memo ? TransactionWithXDRFactory.parseMemo(data.memo.type, data.memo.value) : undefined,
      timeBounds,
      feeAmount: data.fee.toString(),
      feeCharged: data.fee_charged,
      resultCode: data.result_code,
      success: data.successful,
      sourceAccount: data.source_account_id
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

  public static parseMemo(type: 0 | 1 | 2 | 3 | 4, value: string) {
    switch (type) {
      case 0:
        return stellar.Memo.none();
      case 1:
        return stellar.Memo.text(value);
      case 2:
        return stellar.Memo.id(value);
      case 3:
        return stellar.Memo.hash(Buffer.from(value, "base64").toString("hex"));
      case 4:
        return stellar.Memo.return(Buffer.from(value, "base64").toString("hex"));
    }
  }
}
