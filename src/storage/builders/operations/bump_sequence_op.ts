import { SpecificOperationBuilder } from "../";
import { NQuads } from "../../nquads";

export class BumpSequenceOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    this.pushValue("bump_to", this.xdr.bumpTo().toString());

    return this.nquads;
  }

  protected pushResult() {
    const code = this.trXDR.bumpSeqResult().switch().value;
    this.pushValue("bump_sequence_op.result_code", code);
  }
}
