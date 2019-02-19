import stellar from "stellar-base";

import { IBlank, NQuad, NQuads } from "../nquads";
import { Builder } from "./";
import { AccountBuilder } from "./account";

export abstract class SpecificOperationBuilder extends Builder {
  protected sourceAccountBuilder: AccountBuilder;
  protected resultBodyXDR: any;
  protected trXDR: any;

  constructor(
    public readonly current: IBlank,
    protected sourceAccountId: string,
    protected bodyXDR: any,
    protected resultXDR: any
  ) {
    super();

    this.sourceAccountBuilder = new AccountBuilder(sourceAccountId);
    if (this.resultXDR && this.resultXDR.switch() === stellar.xdr.OperationResultCode.opInner()) {
      this.trXDR = this.resultXDR.tr();
    }
  }

  public build(): NQuads {
    this.pushResult();
    return this.nquads;
  }

  protected abstract get resultCode(): number | undefined;
  protected abstract get body(): any;

  protected pushResult() {
    if (this.resultCode === undefined) {
      return;
    }

    const resultNQuad = NQuad.blank(`${this.current.value}_result`);
    this.nquads.push(new NQuad(this.current, "op.result", resultNQuad));
    this.nquads.push(new NQuad(resultNQuad, "result_code", NQuad.value(this.resultCode)));
  }
}
