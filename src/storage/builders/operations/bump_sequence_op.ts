import { NQuads } from "../../nquads";
import { SpecificOperationBuilder } from "../";

export class BumpSequenceOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    this.pushValue("bump_to", this.xdr.bumpTo().toString());

    return this.nquads;
  }

  protected pushResult() {
    const code = this.trXDR.bumpSeqResult().switch().value;
    this.pushValue("bump_sequence_result_code", code);
  }
}
