import { Transaction } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

import * as nquads from "../nquads";

import dig from "object-dig";

interface IContext {
  ledger: nquads.Value;
  current: nquads.Value;
  prev: nquads.Value | null;
}

export class TransactionWriter extends Writer {
  private tx: Transaction;
  private context: IContext;

  constructor(connection: Connection, tx: Transaction, context: IContext) {
    super(connection);
    this.tx = tx;
    this.context = context;
  }

  public async write(): Promise<nquads.Value> {
    const { current, prev } = this.context;

    this.appendRoot();
    this.appendTimeBounds();
    this.appendPrev(current, prev);
    this.appendMemo();

    await this.appendSourceAccount();

    const created = await this.push("transaction");
    return created || current;
  }

  private appendRoot() {
    const { ledger, current } = this.context;

    this.b
      .for(current)
      .append("type", "transaction")
      .append("id", this.tx.id)
      .append("index", this.tx.index)
      .append("seq", this.tx.ledgerSeq)
      .append("order", this.order())
      .append("fee_amount", this.tx.feeAmount);

    this.b.append(ledger, "transactions", current);
    this.b.append(current, "ledger", ledger);
  }

  private appendTimeBounds() {
    const timeBounds = this.tx.timeBounds;

    if (timeBounds) {
      this.b
        .for(this.context.current)
        .append("time_bounds.min", timeBounds[0])
        .append("time_bounds.max", timeBounds[1]);
    }
  }

  private appendMemo() {
    const memo = this.tx.memo;
    const { current } = this.context;

    if (!memo) {
      return;
    }

    const currentMemo = nquads.UID.from(dig(current, 0, "memo", 0, "uid")) || new nquads.Blank("memo");

    this.b
      .for(currentMemo)
      .append("type", memo.type.toString())
      .append("value", memo.value)
      .append("transaction", current);

    this.b.append(current, "memo", currentMemo);
  }

  private async appendSourceAccount() {
    const { current } = this.context;
    const sourceAccount = await this.accountCache.fetch(this.tx.sourceAccount);

    this.b.append(current, "sourceAccount", sourceAccount);
    this.b.append(sourceAccount, "transactions", current);
  }

  private order(): string {
    return `${this.tx.ledgerSeq}-${this.tx.index}`;
  }
}
