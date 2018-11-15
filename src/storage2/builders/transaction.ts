import { Transaction } from "../../model";
import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder } from "./account";
import { Builder } from "./builder";
import { LedgerBuilder } from "./ledger";

export class TransactionBuilder extends Builder {
  public static key(ledgerSeq: number, index: number) {
    return makeKey("transaction", ledgerSeq, index);
  }

  public readonly current: IBlank;
  private seq: number;

  constructor(private tx: Transaction) {
    super();

    this.seq = tx.ledgerSeq;
    this.current = NQuad.blank(TransactionBuilder.key(tx.ledgerSeq, tx.index));

    if (tx.index > 0) {
      this.prev = NQuad.blank(TransactionBuilder.key(tx.ledgerSeq, tx.index - 1));
    }
  }

  public build(): NQuads {
    const v = {
      type: "transaction",
      key: this.current.value,
      id: this.tx.id,
      index: this.tx.index,
      seq: this.seq,
      order: `${this.seq}-${this.tx.index}`,
      fee_amount: this.tx.feeAmount
    };

    if (this.tx.timeBounds) {
      v["time_bounds.min"] = this.tx.timeBounds[0];
      v["time_bounds.max"] = this.tx.timeBounds[1];
    }

    if (this.tx.memo) {
      v["memo.type"] = this.tx.memo.type;
      v["memo.value"] = this.tx.memo.getPlainValue();
    }

    this.pushValues(v);

    this.pushPrev();
    this.pushLedger();
    this.pushSourceAccount();

    return this.nquads;
  }

  private pushSourceAccount() {
    const account = new AccountBuilder(this.tx.sourceAccount);

    //const account = NQuad.blank(AccountBuilder.key(this.tx.sourceAccount));
    this.nquads.push(...account.build());
    this.nquads.push(new NQuad(this.current, "account.source", account.current));
    this.nquads.push(new NQuad(account.current, "transactions", this.current));
  }

  private pushLedger() {
    this.nquads.push(new NQuad(this.current, "ledger", NQuad.blank(LedgerBuilder.key(this.seq))));
  }
}
