import { Asset } from "stellar-sdk";
import { AssetBuilder, SpecificOperationBuilder } from "../";
import { NQuads } from "../../nquads";

export class ChangeTrustOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    this.pushValue("limit", this.xdr.limit().toString());

    const asset = Asset.fromOperation(this.xdr.line());
    this.pushBuilder(new AssetBuilder(asset), "change_trust_op.asset");

    return this.nquads;
  }

  protected get resultCode(): number | undefined {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.changeTrustResult().switch().value;
  }
}
