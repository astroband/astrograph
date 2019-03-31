import { Memoize } from "typescript-memoize";
import { TransactionWithXDR } from "../../model";
import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder, Builder, TransactionBuilder } from "./";
import {
  AccountMergeOpBuilder,
  AllowTrustOpBuilder,
  BumpSequenceOpBuilder,
  ChangeTrustOpBuilder,
  CreateAccountOpBuilder,
  ManageDataOpBuilder,
  ManageOfferOpBuilder,
  PathPaymentOpBuilder,
  PaymentOpBuilder,
  SetOptionsOpBuilder
} from "./operations";

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

  constructor(private tx: TransactionWithXDR, private n: number) {
    super();

    this.seq = tx.ledgerSeq;
    this.index = tx.index;
    this.current = NQuad.blank(OperationBuilder.key(tx.ledgerSeq, this.index, n));

    if (n > 0) {
      this.prev = NQuad.blank(OperationBuilder.key(tx.ledgerSeq, this.index, n - 1));
    }

    this.xdr = tx.operationsXDR[n];
    this.resultXDR = tx.operationResultsXDR ? tx.operationResultsXDR[n] : undefined;
  }

  public build(): NQuads {
    this.pushKey();
    this.pushRoot();
    this.pushPrev("op");

    const builder = this.buildBuilder();
    if (builder) {
      this.pushBuilder(builder);
    }

    return this.nquads;
  }

  protected buildBuilder(): Builder | null {
    const t = stellar.xdr.OperationType;

    const args: [IBlank, string, any, any] = [this.current, this.sourceAccount, this.xdr.body(), this.resultXDR];
    // See comments for examples https://github.com/mobius-network/astrograph/pull/84
    switch (this.xdr.body().switch()) {
      case t.createAccount():
        return new CreateAccountOpBuilder(...args);
      case t.payment():
        return new PaymentOpBuilder(...args);
      case t.pathPayment():
        return new PathPaymentOpBuilder(...args);
      case t.manageOffer():
        return new ManageOfferOpBuilder(...args);
      case t.setOption():
        return new SetOptionsOpBuilder(...args);
      case t.changeTrust():
        return new ChangeTrustOpBuilder(...args);
      case t.accountMerge():
        return new AccountMergeOpBuilder(this.current, this.sourceAccount, this.xdr.body(), this.resultXDR);
      // case t.createPassiveOfferOp():
      //   return this.createPassiveOfferOp();
      // ---
      case t.manageDatum():
        return new ManageDataOpBuilder(...args);
      case t.allowTrust():
        return new AllowTrustOpBuilder(...args);
      case t.bumpSequence():
        return new BumpSequenceOpBuilder(...args);
    }

    return null;
  }

  protected pushRoot() {
    const tx = TransactionBuilder.keyNQuad(this.tx.ledgerSeq, this.index);

    const kind = this.xdr.body().switch().name;

    const values = {
      "op.index": this.n,
      ["kind." + kind]: "",
      "op.kind": kind,
      order: this.order(this.seq, this.index, this.n)
    };

    this.pushValues(values);
    this.pushLedger(this.seq, "op");

    this.nquads.push(new NQuad(this.current, "op.transaction", tx));
    this.pushBuilder(new AccountBuilder(this.sourceAccount), "op.source");
  }

  @Memoize()
  private get sourceAccount(): string {
    const account = this.xdr.sourceAccount();
    if (account) {
      return publicKeyFromBuffer(account.value());
    }
    return this.tx.sourceAccount;
  }
}
