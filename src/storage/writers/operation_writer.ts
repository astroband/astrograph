import { Asset, Transaction } from "../../model";
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
}

export class OperationWriter extends Writer {
  private tx: Transaction;
  private xdr: any;
  private index: number;
  private context: IContext;

  constructor(connection: Connection, tx: Transaction, index: number, context: IContext) {
    super(connection);

    this.tx = tx;
    this.index = index;
    this.context = context;

    this.xdr = tx.operationsXDR()[index];
  }

  public async write(): Promise<nquads.Value> {
    const { current, prev } = this.context;

    this.appendRoot();
    this.appendPrev(current, prev);

    await this.appendAccount(current, "account.source", this.sourceAccount(), "operations");
    await this.appendOp();

    const created = await this.push("operation");
    return created || current;
  }

  private sourceAccount(): string {
    const account = this.xdr.sourceAccount();
    if (account) {
      return publicKeyFromBuffer(account.value());
    }
    return this.tx.sourceAccount;
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

  private order(): string {
    return `${this.tx.ledgerSeq}-${this.tx.index}-${this.index}`;
  }

  private async appendOp() {
    const t = stellar.xdr.OperationType;

    switch (this.xdr.body().switch()) {
      case t.createAccount():
        return this.appendCreateAccountOp();
      case t.payment():
        return this.appendPaymentOp();
      case t.pathPayment():
        return this.pathPaymentOp();
    }
  }

  private async appendCreateAccountOp() {
    const { current } = this.context;
    const op = this.xdr.body().createAccountOp();

    const startingBalance = op.startingBalance().toString();
    const destination = publicKeyFromBuffer(op.destination().value());

    this.b.for(current).append("starting_balance", startingBalance);

    await this.appendAccount(current, "account.destination", destination, "operations");
  }

  private async appendPaymentOp() {
    const { current } = this.context;
    const op = this.xdr.body().paymentOp();

    const amount = op.amount().toString();
    const destination = publicKeyFromBuffer(op.destination().value());
    const assetArgs = assetFromXDR(op.asset());
    const asset = Asset.build(
      assetArgs.assettype,
      assetArgs.assetcode,
      assetArgs.assetissuer
    );

    this.b.append(current, "amount", amount);

    await this.appendAsset(current, "asset", asset, "operations");
    await this.appendAccount(current, "account.destination", destination, "operations");
  }

  private async pathPaymentOp() {
    const { current } = this.context;
    const op = this.xdr.body().pathPaymentOp();

    const sendMax = op.sendMax().toString();
    const destAmount = op.destAmount().toString();

    const destination = publicKeyFromBuffer(op.destination().value());

    this.b
      .for(current)
      .append("send_max", sendMax)
      .append("dest_amount", destAmount);

    await this.appendAccount(current, "account.destination", destination, "operations");
  }
}
