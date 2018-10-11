import { Transaction } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

import * as nquads from "../nquads";

export class TransactionWriter extends Writer {
  public static async build(connection: Connection, tx: Transaction): Promise<TransactionWriter> {
    const writer = new TransactionWriter(connection, tx);
    await writer.loadContext();
    return writer;
  }

  private tx: Transaction;
  private current: nquads.Value = new nquads.Blank("transaction");
  private prev: nquads.Value | null = null;
  private memo: nquads.Value = new nquads.Blank("memo");
  private ledger: nquads.Value = new nquads.Blank("ledger");

  constructor(connection: Connection, tx: Transaction) {
    super(connection);
    this.tx = tx;
  }

  public async write(): Promise<nquads.Value> {
    this.appendRoot();
    this.appendTimeBounds();
    this.appendPrev(this.current, this.prev);
    this.appendMemo();

    await this.appendAccount(this.current, "account.source", this.tx.sourceAccount, "transactions");

    const created = await this.push("transaction");
    return created || this.current;
  }

  protected async loadContext() {
    const { current, prev, memo, ledger } = await this.connection.repo.transaction(this.tx);

    this.current = current || this.current;
    this.prev = prev;
    this.memo = this.memo || memo;

    if (ledger === null) {
      throw new Error("Ledger not found in transaction writer");
    }

    this.ledger = ledger;
  }

  private appendRoot() {
    this.b
      .for(this.current)
      .append("type", "transaction")
      .append("id", this.tx.id)
      .append("index", this.tx.index)
      .append("seq", this.tx.ledgerSeq)
      .append("order", this.order())
      .append("fee_amount", this.tx.feeAmount);

    this.b.append(this.ledger, "transactions", this.current);
    this.b.append(this.current, "ledger", this.ledger);
  }

  private appendTimeBounds() {
    const timeBounds = this.tx.timeBounds;

    if (timeBounds) {
      this.b
        .for(this.current)
        .append("time_bounds.min", timeBounds[0])
        .append("time_bounds.max", timeBounds[1]);
    }
  }

  private appendMemo() {
    const memo = this.tx.memo;

    if (!memo) {
      return;
    }

    this.b
      .for(this.memo)
      .append("type", memo.type.toString())
      .append("value", memo.value)
      .append("transaction", this.current);

    this.b.append(this.current, "memo", this.memo);
  }

  private order(): string {
    return `${this.tx.ledgerSeq}-${this.tx.index}`;
  }
}
