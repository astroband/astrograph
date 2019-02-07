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
      id: node["tx.id"],
      ledgerSeq: parseInt(node["tx.ledger"][0]["ledger.id"], 10),
      index: parseInt(node["tx.index"], 10),
      memo,
      feeAmount: node.fee_amount,
      feeCharged: node.fee_charged,
      success: node.success,
      resultCode: node.result_code,
      sourceAccount: node["tx.source"][0]["account.id"],
      timeBounds
    });
  }
}
