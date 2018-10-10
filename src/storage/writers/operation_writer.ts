import { Connection } from "../connection";
import { Writer } from "./writer";

import { publicKeyFromBuffer } from "../../util/xdr/account";
import { assetFromXDR } from "../../util/xdr/asset";

import stellar from "stellar-base";
import * as nquads from "../nquads";

export interface IContext {
  current: nquads.Value;
  prev: nquads.Value | null;
  ledger: nquads.Value;
  tx: nquads.Value;
  txIndex: number;
  seq: number;
}

export class OperationWriter extends Writer {
  private xdr: any;
  private index: number;
  private context: IContext;

  constructor(connection: Connection, xdr: any, index: number, context: IContext) {
    super(connection);

    this.xdr = xdr;
    this.index = index;
    this.context = context;
  }

  public async write(): Promise<nquads.Value> {
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
      .append("order", this.order())
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

  private order(): string {
    return `${this.context.seq}-${this.context.txIndex}-${this.index}`;
  }

  private async appendOp() {
    const t = stellar.xdr.OperationType;

    switch (this.xdr.body().switch()) {
      case t.createAccount():
        return this.appendCreateAccountOp();
      case t.payment():
        return this.appendPaymentOp();
    }
  }

  private async appendCreateAccountOp() {
    const { current } = this.context;
    const op = this.xdr.body().createAccountOp();

    const startingBalance = op.startingBalance().toString();
    const destination = publicKeyFromBuffer(op.destination().value());

    this.b.for(current).append("startingBalance", startingBalance);

    await this.appendAccount("destinationAccount", destination);
  }

  private async appendPaymentOp() {
    const { current } = this.context;
    const op = this.xdr.body().paymentOp();

    const amount = op.amount().toString();
    const destination = publicKeyFromBuffer(op.destination().value());
    const { assettype, assetcode, issuer } = assetFromXDR(op.asset());

    this.b
      .for(current)
      .append("amount", amount)
      .append("assetType", assettype)
      .append("assetCode", assetcode);

    await this.appendAccount("destinationAccount", destination);
    await this.appendAccount("assetIssuerAccount", issuer, "ownAssetsOperations");
  }

  private async appendAccount(predicate: string, id: string, foreignKey: string = "operations") {
    const { current } = this.context;
    const account = await this.accountCache.fetch(id);

    this.b
      .for(current)
      .append(`${predicate}ID`, id)
      .append(`${predicate}`, account);

    this.b.append(account, foreignKey, current);
  }
}
