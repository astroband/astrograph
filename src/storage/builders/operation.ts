import { Transaction } from "../../model";
import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder } from "./account";
import { AllowTrustOpBuilder } from "./allow_trust_op";
import { Builder } from "./builder";
import { BumpSequenceOpBuilder } from "./bump_sequence_op";
import { ChangeTrustOpBuilder } from "./change_trust_op";
import { CreateAccountOpBuilder } from "./create_account_op";
import { LedgerBuilder } from "./ledger";
import { ManageOfferOpBuilder } from "./manage_offer_op";
import { PathPaymentOpBuilder } from "./path_payment_op";
import { PaymentOpBuilder } from "./payment_op";
import { SetOptionsOpBuilder } from "./set_options_op";
import { TransactionBuilder } from "./transaction";

import stellar from "stellar-base";

import { publicKeyFromBuffer } from "../../util/xdr/account";

export class OperationBuilder extends Builder {
  public static key(ledgerSeq: number, index: number, n: number) {
    return makeKey("operation", ledgerSeq, index, n);
  }

  public readonly current: IBlank;
  private seq: number;
  private index: number;
  private xdr: any;
  private resultXDR: any;

  constructor(private tx: Transaction, private n: number) {
    super();

    this.seq = tx.ledgerSeq;
    this.index = tx.index;
    this.current = NQuad.blank(OperationBuilder.key(tx.ledgerSeq, this.index, n));

    if (n > 0) {
      this.prev = NQuad.blank(OperationBuilder.key(tx.ledgerSeq, tx.index, n - 1));
    }

    this.xdr = tx.operationsXDR()[n];
    this.resultXDR = tx.operationResultsXDR()[n];
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
        return new CreateAccountOpBuilder(this.current, this.xdr.body().createAccountOp(), this.resultXDR);
      case t.payment():
        return new PaymentOpBuilder(this.current, this.xdr.body().paymentOp());
      case t.pathPayment():
        return new PathPaymentOpBuilder(this.current, this.xdr.body().pathPaymentOp());
      case t.manageOffer():
        return new ManageOfferOpBuilder(this.current, this.xdr.body().manageOfferOp());
      case t.setOption():
        return new SetOptionsOpBuilder(this.current, this.xdr.body().setOptionsOp(), this.resultXDR);
      case t.changeTrust():
        return new ChangeTrustOpBuilder(this.current, this.xdr.body().changeTrustOp(), this.resultXDR);
      // case t.createPassiveOfferOp():
      //   return this.createPassiveOfferOp();
      // ---
      case t.allowTrust():
        return new AllowTrustOpBuilder(this.current, this.xdr.body().allowTrustOp(), this.resultXDR);
      case t.bumpSequence():
        return new BumpSequenceOpBuilder(this.current, this.xdr.body().bumpSequenceOp(), this.resultXDR);
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
      order: `${this.seq}-${this.index}-${this.n}`
    };

    this.pushValues(values);
    this.pushLedger(this.seq);
    this.pushResult();

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

  private pushResult() {
    this.pushValue("result_code", this.resultXDR.switch().value);
    this.pushValue("success", this.resultXDR.switch() === stellar.xdr.OperationResultCode.opInner());
  }
}
