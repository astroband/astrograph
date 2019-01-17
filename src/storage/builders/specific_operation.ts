import stellar from "stellar-base";

import { IBlank, NQuads } from "../nquads";
import { Builder } from "./";

export abstract class SpecificOperationBuilder extends Builder {
  protected resultBodyXDR: any;
  protected trXDR: any;

  constructor(public readonly current: IBlank, protected xdr: any, protected resultXDR: any) {
    super();

    if (this.resultXDR.switch() === stellar.xdr.OperationResultCode.opInner()) {
      this.trXDR = this.resultXDR.tr();
    }
  }

  public build(): NQuads {
    if (this.trXDR) {
      this.pushResult();
    }

    return this.nquads;
  }

  protected abstract pushResult(): void;
}
