import { Transaction } from "../../model";
import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder } from "./account";
import { Builder } from "./builder";
import { LedgerBuilder } from "./ledger";
import { TransactionBuilder } from "./transaction";
import { CreateAccountOpBuilder } from "./create_account_op";

import stellar from "stellar-base";

import { publicKeyFromBuffer } from "../../util/xdr/account";

export class OperationBuilder extends Builder {
  public static key(ledgerSeq: number, index: number, n: number) {
    return makeKey("transaction", ledgerSeq, index, n);
  }

  public readonly current: IBlank;
  private seq: number;
  private index: number;
  private xdr: any;

  constructor(private tx: Transaction, private n: number) {
    super();

    this.seq = tx.ledgerSeq;
    this.index = tx.index;
    this.current = NQuad.blank(OperationBuilder.key(tx.ledgerSeq, this.index, n));

    if (n > 0) {
      this.prev = NQuad.blank(OperationBuilder.key(tx.ledgerSeq, tx.index, n - 1));
    }

    this.xdr = tx.operationsXDR()[n];
  }

  public build(): NQuads {
    this.pushKey();    
    this.pushRoot();
    this.pushPrev();

    const builder = this.buildBuilder();
    if (builder) {
      this.pushBuilder(builder);
    }

    return this.nquads;
  }

  protected buildBuilder(): Builder | null {
    const t = stellar.xdr.OperationType;

    switch (this.xdr.body().switch()) {
      case t.createAccount():
        return new CreateAccountOpBuilder(this.current, this.xdr);
      // case t.payment():
      //   return this.appendPaymentOp();
      // case t.pathPayment():
      //   return this.pathPaymentOp();
      // case t.manageOffer():
      //   return this.manageOfferOp();
      // case t.createPassiveOfferOp():
      //   return this.createPassiveOfferOp();
    }

    return null;
  }

  protected pushRoot() {
    const tx = TransactionBuilder.keyNQuad(this.tx.ledgerSeq, this.tx.index);
    const ledger = LedgerBuilder.keyNQuad(this.tx.ledgerSeq);

    const values = {
      type: "operation",
      index: this.n,
      kind: this.xdr.body().switch().name,
      order: `${this.seq}-${this.index}-${this.n}`,
    }

    this.pushValues(values);
    this.pushLedger(this.seq);

    this.nquads.push(new NQuad(this.current, "transaction", tx));
    this.nquads.push(new NQuad(tx, "operations", this.current));
    this.nquads.push(new NQuad(ledger, "operations", this.current));

    this.pushBuilder(new AccountBuilder(this.sourceAccount()), "account.source", "operations");
  }

  private sourceAccount(): string {
    const account = this.xdr.sourceAccount();
    if (account) {
      return publicKeyFromBuffer(account.value());
    }
    return this.tx.sourceAccount;
  }
}
