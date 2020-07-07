import stellar from "stellar-base";
import { ITransactionData as IStorageTransactionData } from "../../storage/types";
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
    const resultXDR = stellar.xdr.TransactionResultPair.fromXDR(row.txresult, "base64");
    const metaXDR = stellar.xdr.TransactionMeta.fromXDR(row.txmeta, "base64");
    const feeMetaXDR = stellar.xdr.OperationMeta.fromXDR(row.txfeemeta, "base64");

    const tx = new stellar.Transaction(row.txbody, stellar.Networks.TESTNET);

    const result = resultXDR.result();

    const resultCode = result.result().switch().value;
    const success = resultCode === stellar.xdr.TransactionResultCode.txSuccess().value;
    const feeCharged = result.feeCharged().toString();

    let timeBounds: ITimeBounds | undefined;

    if (tx.timeBounds) {
      timeBounds = { minTime: new Date(tx.timeBounds.minTime * 1000) };

      if (tx.timeBounds.maxTime !== "0") {
        timeBounds.maxTime = new Date(tx.timeBounds.maxTime * 1000);
      }
    }

    const data: ITransactionWithXDR = {
      id: row.txid,
      index: row.txindex,
      ledgerSeq: row.ledgerseq,
      body: row.txbody,
      bodyXDR: tx.tx,
      result: row.txresult,
      resultXDR,
      meta: row.txmeta,
      metaXDR,
      feeMeta: row.txfeemeta,
      feeMetaXDR,
      memo: tx.memo.value ? tx.memo : undefined,
      timeBounds,
      feeAmount: tx.fee,
      feeCharged,
      resultCode,
      success,
      sourceAccount: tx.source,
      operationsXDR: tx.operations,
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
      feeAmount: data.max_fee.toString(),
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
