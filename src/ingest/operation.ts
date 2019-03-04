import stellar from "stellar-base";
import { Memoize } from "typescript-memoize";
import { TransactionWithXDR } from "../model";
import { AccountBuilder } from "../storage/builders";
import { NQuad, NQuads } from "../storage/nquads";
import { publicKeyFromBuffer } from "../util/xdr/account";

export class OperationIngestor {
  private xdr: any;

  constructor(private tx: TransactionWithXDR, n: number) {
    this.xdr = tx.operationsXDR[n];
  }

  public ingest(): NQuads {
    const nquads = new NQuads();
    const t = stellar.xdr.OperationType;

    if (this.xdr.body().switch() !== t.createAccount()) {
      return nquads;
    }

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
