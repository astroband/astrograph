import stellar from "stellar-base";
import { Memo } from "stellar-sdk";
import { ITransactionData } from "../../storage/types";
import { publicKeyFromBuffer } from "../../util/xdr/account";
import { TimeBounds, Transaction } from "../transaction";

export interface ITransactionTableRow {
  txid: string;
  ledgerseq: number;
  txindex: number;
  txbody: string;
  txresult: string;
  txmeta: string;
  txfeemeta: string;
}

export class TransactionFactory {
  public static fromDb(row: ITransactionTableRow) {
    const bodyXDR = stellar.xdr.TransactionEnvelope.fromXDR(Buffer.from(row.txbody, "base64"));
    const resultXDR = stellar.xdr.TransactionResultPair.fromXDR(Buffer.from(row.txresult, "base64"));
    const result = resultXDR.result();
    const resultCode = result.result().switch().value;

    const body = bodyXDR.tx();
    const memo = Memo.fromXDRObject(body.memo());
    const timeBoundsXDR = body.timeBounds();

    const timeBounds: TimeBounds | undefined = timeBoundsXDR
      ? [timeBoundsXDR.minTime().toInt(), timeBoundsXDR.maxTime().toInt()]
      : undefined;

    const data = {
      id: row.txid,
      ledgerSeq: row.ledgerseq,
      index: row.txindex,
      memo: memo.value ? memo : undefined,
      feeAmount: body.fee().toString(),
      sourceAccount: publicKeyFromBuffer(body.sourceAccount().value()),
      timeBounds,
      feeCharged: result.feeCharged().toString(),
      success: resultCode === stellar.xdr.TransactionResultCode.txSuccess().value,
      resultCode
    };

    return new Transaction(data);
  }

  public static fromDgraph(node: ITransactionData) {
    let memo: Memo = Memo.none();

    if (node["memo.value"]) {
      memo = new Memo(node["memo.type"]!, node["memo.value"]!);
    }

    return new Transaction({
      id: node.id,
      ledgerSeq: parseInt(node.seq, 10),
      index: parseInt(node.index, 10),
      memo,
      feeAmount: node.fee_amount,
      feeCharged: node.fee_charged,
      success: node.success,
      resultCode: node.result_code,
      sourceAccount: node["account.source"][0].id,
      timeBounds: [node["time_bounds.min"], node["time_bounds.max"]]
    });
  }
}
