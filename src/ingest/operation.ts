import stellar from "stellar-base";
import { Memoize } from "typescript-memoize";
import { Asset, TransactionWithXDR } from "../model";
import { AccountBuilder } from "../storage/builders";
import { NQuad, NQuads } from "../storage/nquads";
import { publicKeyFromBuffer } from "../util/xdr/account";

export class OperationIngestor {
  private readonly xdr: any;

  constructor(private readonly tx: TransactionWithXDR, n: number) {
    this.xdr = tx.operationsXDR[n];
  }

  public ingest(): NQuads {
    const t = stellar.xdr.OperationType;

    switch (this.xdr.body().switch()) {
      case t.createAccount():
        return this.ingestCreateAccountOp();
      case t.payment():
        return this.ingestPaymentOp();
      default:
        return new NQuads();
    }
  }

  private ingestPaymentOp() {
    const nquads = new NQuads();
    const body = this.xdr.body().paymentOp();
    const asset = Asset.fromOperation(body.asset());

    nquads.push(
      new NQuad(
        NQuad.blank(AccountBuilder.key(this.sourceAccount)),
        "account.last_paid_to",
        NQuad.blank(AccountBuilder.keyFromXDR(body.destination())),
        {
          asset: asset.toString(),
          amount: body.amount().toString(),
          seq: this.tx.ledgerSeq
        }
      )
    );

    return nquads;
  }

  private ingestCreateAccountOp() {
    const nquads = new NQuads();
    const body = this.xdr.body().createAccountOp();
    const destinationId = publicKeyFromBuffer(body.destination().value());

    nquads.push(
      new NQuad(
        NQuad.blank(AccountBuilder.key(destinationId)),
        "account.created_by",
        NQuad.blank(AccountBuilder.key(this.sourceAccount))
      )
    );

    return nquads;
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
