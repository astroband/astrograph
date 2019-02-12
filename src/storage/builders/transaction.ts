import { ITransaction } from "../../model";
import { makeKey } from "../../util/crypto";
import "../../util/memo";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder, Builder } from "./";

export class TransactionBuilder extends Builder {
  public static key(ledgerSeq: number, index: number) {
    return makeKey("transaction", ledgerSeq, index);
  }

  public static keyNQuad(ledgerSeq: number, index: number) {
    return NQuad.blank(TransactionBuilder.key(ledgerSeq, index));
  }

  public readonly current: IBlank;
  private seq: number;

  constructor(private tx: ITransaction) {
    super();

    this.seq = tx.ledgerSeq;
    this.current = TransactionBuilder.keyNQuad(tx.ledgerSeq, tx.index);

    if (tx.index > 0) {
      this.prev = TransactionBuilder.keyNQuad(tx.ledgerSeq, tx.index - 1);
    }
  }

  public build(): NQuads {
    const v = {
      "type.transaction": "",
      type: "transaction",
      key: this.current.value,
      id: this.tx.id,
      index: this.tx.index,
      seq: this.seq,
      order: this.order(this.seq, this.tx.index),
      fee_amount: this.tx.feeAmount,
      fee_charged: this.tx.feeCharged,
      success: this.tx.success,
      result_code: this.tx.resultCode
    };

    if (this.tx.memo) {
      v["memo.type"] = this.tx.memo.type;
      v["memo.value"] = this.tx.memo.getPlainValue();
    }

    this.pushValues(v);
    this.pushTimeBounds();

    this.pushPrev();
    this.pushLedger(this.seq);
    this.pushSourceAccount();

    return this.nquads;
  }

  private pushSourceAccount() {
    const account = new AccountBuilder(this.tx.sourceAccount);
    this.pushBuilder(account, "account.source", "transactions");
  }

  private pushTimeBounds() {
    if (!this.tx.timeBounds) {
      return;
    }

    this.pushValue("time_bounds.min", this.tx.timeBounds[0].toISOString());

    if (this.tx.timeBounds[1] instanceof Date) {
      this.pushValue("time_bounds.max", this.tx.timeBounds[1].toISOString());
    }
  }
}
