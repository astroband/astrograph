import { NQuads } from "../../nquads";
import { SpecificOperationBuilder } from "../specific_operation";

export class ManageDataOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    this.pushValue("name", this.xdr.dataName().toString());
    this.pushValue("value", this.xdr.dataValue());

    return this.nquads;
  }

  protected pushResult() {
    const code = this.trXDR.manageDataResult().switch().value;
    this.pushValue("manage_data_result_code", code);
  }
}
