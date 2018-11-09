import { Asset } from "stellar-sdk";
import { BigNumber } from 'bignumber.js';
import { PaymentOperation, Transaction } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

import { publicKeyFromBuffer } from "../../util/xdr/account";

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

    this.current = new nquads.Blank(`op_${tx.ledgerSeq}_${tx.index}_${index}`);

    this.xdr = tx.operationsXDR()[index];
  }

  public async write(): Promise<nquads.Value> {
    this.appendRoot();
    this.appendPrev(this.current, this.prev);

    await this.appendAccount(this.current, "account.source", this.sourceAccount(), "operations");
    await this.appendOp();

    const created = await this.push(`op_${this.tx.ledgerSeq}_${this.tx.index}_${this.index}`);
    return created || this.current;
  }

  protected async loadContext() {
    const { current, prev, transaction, ledger } = await this.connection.repo.operation(this.tx, this.index);

    this.current = current || this.current;
    this.prev = prev;

    if (ledger === null) {
      throw new Error(`Ledger ${this.tx.ledgerSeq} not found in operation writer`);
    }

    this.ledger = ledger;

    if (transaction === null) {
      throw new Error(`Transaction ${this.tx.id} not found in operation writer`);
    }

    this.transaction = transaction;
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
      case t.manageOffer():
        return this.manageOfferOp();
      case t.createPassiveOfferOp():
        return this.createPassiveOfferOp();
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
    const op = PaymentOperation.buildFromXDR(this.xdr);

    this.b.append(this.current, "amount", op.amount);

    await this.appendAsset(this.current, "asset", op.asset, "operations");
    await this.appendAccount(this.current, "account.destination", op.destination, "operations");
  }

  private async pathPaymentOp() {
    const op = this.xdr.body().pathPaymentOp();

    const sendMax = op.sendMax().toString();
    const destAmount = op.destAmount().toString();

    const destination = publicKeyFromBuffer(op.destination().value());
    const sendAsset = Asset.fromOperation(op.sendAsset());
    const destAsset = Asset.fromOperation(op.destAsset());

    await this.appendAsset(this.current, "send.asset", sendAsset, "operations");
    await this.appendAsset(this.current, "dest.asset", destAsset, "operations");

    this.b
      .for(this.current)
      .append("send.max", sendMax)
      .append("dest.amount", destAmount);

    await this.appendAccount(this.current, "account.destination", destination, "operations");
  }

  private async manageOfferOp() {
    const op = this.xdr.body().manageOfferOp();

    const sellingAsset = Asset.fromOperation(op.selling());
    const buyingAsset = Asset.fromOperation(op.buying());
    const amount = op.amount().toString();
    const price = new BigNumber(op.price().n()).div(new BigNumber(op.price().d())).toString();

    const id = op.offerId().toString();

    await this.appendAsset(this.current, "selling.asset", sellingAsset, "operations");
    await this.appendAsset(this.current, "buying.asset", buyingAsset, "operations");

    this.b
      .for(this.current)
      .append("amount", amount)
      .append("price", price)
      .append("id", id);
  }

  private async createPassiveOfferOp() {
    const op = this.xdr.body().createPassiveOfferOp();

    const sellingAsset = Asset.fromOperation(op.selling());
    const buyingAsset = Asset.fromOperation(op.buying());
    const amount = op.amount().toString();
    const price = new BigNumber(op.price().n()).div(new BigNumber(op.price().d())).toString();

    await this.appendAsset(this.current, "selling.asset", sellingAsset, "operations");
    await this.appendAsset(this.current, "buying.asset", buyingAsset, "operations");

    this.b
      .for(this.current)
      .append("amount", amount)
      .append("price", price);
  }
}
