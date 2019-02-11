import stellar from "stellar-base";

import { IBlank, NQuad, NQuads } from "../nquads";
import { Builder } from "./";

export abstract class SpecificOperationBuilder extends Builder {
  protected resultBodyXDR: any;
  protected trXDR: any;

  constructor(public readonly current: IBlank, protected xdr: any, protected resultXDR: any) {
    super();

    if (this.resultXDR && this.resultXDR.switch() === stellar.xdr.OperationResultCode.opInner()) {
      this.trXDR = this.resultXDR.tr();
    }
  }

  public build(): NQuads {
    this.pushResult();
    return this.nquads;
  }

  protected abstract get resultCode(): number | undefined;

  protected pushResult() {
    if (this.resultCode === undefined) {
      return;
    }

    const resultNQuad = NQuad.blank(`${this.current.value}_result`);
    this.nquads.push(new NQuad(this.current, "op.result", resultNQuad));
    this.nquads.push(new NQuad(resultNQuad, "result_code", NQuad.value(this.resultCode)));
  }
}
