import { Asset } from "stellar-sdk";
import { Memoize } from "typescript-memoize";
import { AccountBuilder, AssetBuilder, SpecificOperationBuilder } from "../";
import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { NQuads } from "../../nquads";

export class AllowTrustOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();

    const id = publicKeyFromBuffer(this.body.trustor().value());
    const assetCode = this.body
      .asset()
      .value()
      .toString()
      .replace(/\0/g, "");
    const asset = new Asset(assetCode, this.sourceAccountId);

    this.pushBuilder(new AccountBuilder(id), "allow_trust_op.trustor");
    this.pushBuilder(new AssetBuilder(asset), "allow_trust_op.asset", "operations");
    this.pushValue("authorize", this.body.authorize());

    return this.nquads;
  }

  protected get resultCode(): number | undefined {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.allowTrustResult().switch().value;
  }

  @Memoize()
  protected get body(): any {
    return this.bodyXDR.allowTrustOp();
  }
}
