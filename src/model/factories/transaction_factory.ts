import { Memo } from "stellar-sdk";
import { ITransactionData } from "../../storage/types";
import { ITimeBounds, Transaction } from "../transaction";

export class TransactionFactory {
  public static fromDgraph(node: ITransactionData) {
    let memo: Memo = Memo.none();

    if (node["memo.value"]) {
      memo = new Memo(node["memo.type"]!, node["memo.value"]!);
    }

    const timeBounds: ITimeBounds = {
      minTime: new Date(node["time_bounds.min"]),
      maxTime: node["time_bounds.max"] ? new Date(node["time_bounds.max"]) : undefined
    };

    return new Transaction({
      id: node.id,
      ledgerSeq: parseInt(node.seq, 10),
      index: parseInt(node.index, 10),
      memo,
      feeAmount: node.fee_amount,
      feeCharged: node.fee_charged,
      success: node.success,
      resultCode: node.result_code,
      sourceAccount: node["account.source"][0]["account.id"],
      timeBounds
    });
  }
}
