import { publicKeyFromBuffer } from "../../util/xdr/account";
import { NQuads } from "../nquads";
import { AccountBuilder } from "./account";
import { SpecificOperationBuilder } from "./specific_operation";

export class AllowTrustOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    this.pushBuilder(
      new AccountBuilder(publicKeyFromBuffer(this.xdr.trustor().value())),
      "trustor",
      "operations"
    );
    this.pushValue("asset_code", this.xdr.asset().value().toString().replace(/\0/g, ""));
    this.pushValue("authorize", this.xdr.authorize());

    return this.nquads;
  }

  protected pushResult() {
    const code = this.trXDR.allowTrustResult().switch().value;
    this.pushValue("allow_trust_result_code", code);
  }
}
