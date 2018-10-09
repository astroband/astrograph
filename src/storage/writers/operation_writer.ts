import { Connection } from "../connection";
import { Writer } from "./writer";
import { nquads } from "../nquads";

import { publicKeyFromBuffer } from "../../util/xdr/account";

import stellar from "stellar-base";

export interface IContext {
  current: nquads.IValue;
  prev: nquads.IValue;
  ledger: nquads.IValue;
  tx: nquads.IValue;
  txIndex: number;
  seq: number;
}

export class Operation extends Writer {
  private xdr: any;
  private index: number;
  private context: IContext;

  constructor(connection: Connection, xdr: any, index: number, context: IContext) {
    super(connection);

    this.xdr = xdr;
    this.index = index;
    this.context = context;
  }

  public async write(): Promise<nquads.IValue> {
    const { current, prev } = this.context;

    this.appendRoot();
    this.appendPrev(current, prev);

    await this.appendSourceAccount();
    await this.appendOp();

    const created = await this.push("operation");
    return created || current;
  }

  private appendRoot() {
    const { current, ledger, tx } = this.context;

    this.b
      .for(current)
      .append("type", "operation")
      .append("ledger", ledger)
      .append("index", this.index)
      .append("kind", this.xdr.body().switch().name)
      .append("sortHandle", this.sortHandle())
      .append("transaction", tx);

    this.b.append(tx, "operations", current);
    this.b.append(ledger, "operations", current);
  }

  private async appendSourceAccount() {
    const account = this.xdr.sourceAccount();

    if (account) {
      const { current } = this.context;
      const id = publicKeyFromBuffer(account.value());
      const sourceAccount = await this.accountCache.fetch(id);

      this.b.append(current, "sourceAccountID", id);
      this.b.append(current, "sourceAccount", sourceAccount);
      this.b.append(sourceAccount, "transactions", current);
    }
  }

  private async appendOp() {
    const t = stellar.xdr.OperationType;

    switch (this.xdr.body().switch()) {
      case t.createAccount():
        return this.appendCreateAccountOp();
    }
  }

  private async appendCreateAccountOp() {
    const op = this.xdr.body().createAccountOp();
    const destination = publicKeyFromBuffer(op.destination().value());
    const startingBalance = op.startingBalance().toString();
    const destinationAccount = await this.accountCache.fetch(destination);
    const { current } = this.context;

    this.b
      .for(current)
      .append("destinationAccountID", destination)
      .append("destinationAccount", destinationAccount)
      .append("startingBalance", startingBalance);

    this.b.append(destinationAccount, "operations", current);
  }

  private sortHandle(): string {
    return `${this.context.seq}-${this.context.txIndex}-${this.index}`;
  }
}
