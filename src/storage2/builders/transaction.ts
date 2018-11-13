import { makeKey } from "../../util/crypto";
import { AccountBuilder } from "./account";
import { LedgerBuilder } from "./ledger";
import { Transaction } from "../../model";
import { NQuad, NQuads, IBlank } from "../nquads";

interface ITransactionPredicates {
  type: string;
  key: string;
  id: string;
  index: number;
  seq: number;
  order: string;
  fee_amount: string;
  "memo.type"?: string;
  "memo.value"?: string | null;
  "time_bounds.min"?: number;
  "time_bounds.max"?: number;
};

export class TransactionBuilder {
  private nquads: NQuads = [];
  private current: IBlank;
  private ledgerSeq: number;

  constructor(private tx: Transaction) {
    this.current = NQuad.blank(
      TransactionBuilder.key(tx.ledgerSeq, tx.index)
    );
    this.ledgerSeq = tx.ledgerSeq;
  }

  public static build(tx: Transaction) {
    const builder = new TransactionBuilder(tx);
    return builder.build();
  }

  public build(): NQuads {
    const predicateValues: ITransactionPredicates = {
      type: "transaction",
      key: this.current.value,
      id: this.tx.id,
      index: this.tx.index,
      seq: this.ledgerSeq,
      order: `${this.ledgerSeq}-${this.tx.index}`,
      fee_amount: this.tx.feeAmount,
    };

    if (this.tx.timeBounds) {
      predicateValues["time_bounds.min"] = this.tx.timeBounds[0];
      predicateValues["time_bounds.max"] = this.tx.timeBounds[1];
    }

    if (this.tx.memo) {
      predicateValues["memo.type"] = this.tx.memo.type;
      predicateValues["memo.value"] = this.tx.memo.getPlainValue();
    }

    this.attachValues(predicateValues);

    this.attachPreviousTx();
    this.attachLedger();
    this.attachSourceAccount();

    return this.nquads;
  }

  public static key(ledgerSeq: number, index: number) {
    return makeKey("transaction", ledgerSeq, index);
  }

  private attachPreviousTx() {
    const prev = NQuad.blank(
      TransactionBuilder.key(this.ledgerSeq, this.tx.index - 1),
    );
    this.nquads.push(new NQuad(this.current, "prev", prev));
    this.nquads.push(new NQuad(prev, "next", this.current));
  }

  private attachSourceAccount() {
    const account = NQuad.blank(AccountBuilder.key(this.tx.sourceAccount));
    this.nquads.push(...AccountBuilder.build(this.tx.sourceAccount));
    this.nquads.push(
      new NQuad(this.current, "account.source", account)
    );
    this.nquads.push(
      new NQuad(account, "transactions", this.current),
    );
  }

  private attachLedger() {
    this.nquads.push(
      new NQuad(
        this.current,
        "ledger",
        NQuad.blank(LedgerBuilder.key(this.ledgerSeq)),
      )
    )
  }

  private attachValues(data: ITransactionPredicates) {
    for (let key in data) {
      this.attachValue(key, data[key]);
    }
  }

  private attachValue(predicate: string, value: any) {
    this.nquads.push(
      new NQuad(this.current, predicate, NQuad.value(value))
    );
  }
}
