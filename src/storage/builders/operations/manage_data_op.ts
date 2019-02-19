import { Memoize } from "typescript-memoize";
import { SpecificOperationBuilder } from "../";
import { NQuads } from "../../nquads";

export class ManageDataOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    this.pushValue("name", this.body.dataName().toString());

    const value = this.body.dataValue() ? this.body.dataValue().toString("base64") : undefined;
    this.pushValue("value", value);

    return this.nquads;
  }

  protected get resultCode(): number | undefined {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.manageDataResult().switch().value;
  }

  @Memoize()
  protected get body(): any {
    return this.bodyXDR.manageDataOp();
  }
}
