import { NQuads } from "../nquads";
import { SpecificOperationBuilder } from "./specific_operation";

export class BumpSequenceOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    this.pushValue("bump_to", this.xdr.bumpTo().toString());

    return this.nquads;
  }

  protected pushResult() {
    const code = this.trXDR.bumpSequenceResult().switch().value;
    this.pushValue("bump_sequence_result_code", code);
  }
}
