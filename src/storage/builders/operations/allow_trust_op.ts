import { AccountBuilder, SpecificOperationBuilder } from "../";
import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { NQuads } from "../../nquads";

export class AllowTrustOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    const id = publicKeyFromBuffer(this.xdr.trustor().value());
    const assetCode = this.xdr
      .asset()
      .value()
      .toString()
      .replace(/\0/g, "");

    this.pushBuilder(new AccountBuilder(id), "trustor", "operations");
    this.pushValue("asset_code", assetCode);
    this.pushValue("authorize", this.xdr.authorize());

    return this.nquads;
  }

  protected pushResult() {
    const code = this.trXDR.allowTrustResult().switch().value;
    this.pushValue("allow_trust_result_code", code);
  }
}
