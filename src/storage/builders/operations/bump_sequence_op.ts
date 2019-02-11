import { SpecificOperationBuilder } from "../";
import { NQuads } from "../../nquads";

export class BumpSequenceOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    this.pushValue("bump_to", this.xdr.bumpTo().toString());

    return this.nquads;
  }

  protected get resultCode() {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.bumpSeqResult().switch().value;
  }
}
