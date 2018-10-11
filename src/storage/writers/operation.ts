import { Asset, Transaction } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

import { publicKeyFromBuffer } from "../../util/xdr/account";
import { assetFromXDR } from "../../util/xdr/asset";

import stellar from "stellar-base";
import * as nquads from "../nquads";

export class OperationWriter extends Writer {
  public static async build(connection: Connection, tx: Transaction, index: number): Promise<OperationWriter> {
    const writer = new OperationWriter(connection, tx, index);
    await writer.loadContext();
    return writer;
  }

  private tx: Transaction;
  private index: number;
  private current: nquads.Value;
  private prev: nquads.Value | null = null;
  private ledger: nquads.Value = new nquads.Blank("ledger");
  private transaction: nquads.Value = new nquads.Blank("transaction");

  private xdr: any;

  constructor(connection: Connection, tx: Transaction, index: number) {
    super(connection);

    this.tx = tx;
    this.index = index;

    this.current = new nquads.Blank(`op_${tx.ledgerSeq}-${tx.index}-${index}`);

    this.xdr = tx.operationsXDR()[index];
  }

  public async write(): Promise<nquads.Value> {
    this.appendRoot();
    this.appendPrev(this.current, this.prev);

    await this.appendAccount(this.current, "account.source", this.sourceAccount(), "operations");
    await this.appendOp();

    const created = await this.push("operation");
    return created || this.current;
  }

  protected async loadContext() {
    const { current, prev, transaction, ledger } = await this.connection.repo.operation(this.tx, this.index);

    this.current = current || this.current;
    this.prev = prev;

    if (ledger === null) {
      throw new Error("Ledger not found in transaction writer");
    }

    this.ledger = ledger;

    if (transaction === null) {
      throw new Error("Transaction not found in transaction writer");
    }

    this.transaction = this.transaction;
  }

  private sourceAccount(): string {
    const account = this.xdr.sourceAccount();
    if (account) {
      return publicKeyFromBuffer(account.value());
    }
    return this.tx.sourceAccount;
  }

  private appendRoot() {
    this.b
      .for(this.current)
      .append("type", "operation")
      .append("ledger", this.ledger)
      .append("index", this.index)
      .append("kind", this.xdr.body().switch().name)
      .append("order", this.order())
      .append("transaction", this.transaction);

    this.b.append(this.transaction, "operations", this.current);
    this.b.append(this.ledger, "operations", this.current);
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
    const op = this.xdr.body().createAccountOp();

    const startingBalance = op.startingBalance().toString();
    const destination = publicKeyFromBuffer(op.destination().value());

    this.b.for(this.current).append("starting_balance", startingBalance);

    await this.appendAccount(this.current, "account.destination", destination, "operations");
  }

  private async appendPaymentOp() {
    const op = this.xdr.body().paymentOp();

    const amount = op.amount().toString();
    const destination = publicKeyFromBuffer(op.destination().value());
    const a = assetFromXDR(op.asset());
    const asset = Asset.build(a.assettype, a.assetcode, a.assetissuer);

    this.b.append(this.current, "amount", amount);

    await this.appendAsset(this.current, "asset", asset, "operations");
    await this.appendAccount(this.current, "account.destination", destination, "operations");
  }

  private async pathPaymentOp() {
    // const { current } = this.context;
    // const op = this.xdr.body().pathPaymentOp();
    //
    // const sendMax = op.sendMax().toString();
    // const destAmount = op.destAmount().toString();
    //
    // const destination = publicKeyFromBuffer(op.destination().value());
    //
    // this.b
    //   .for(current)
    //   .append("send_max", sendMax)
    //   .append("dest_amount", destAmount);
    //
    // await this.appendAccount(current, "account.destination", destination, "operations");
  }
}
