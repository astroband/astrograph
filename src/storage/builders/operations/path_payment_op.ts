import { Memoize } from "typescript-memoize";
import { AccountBuilder, AssetBuilder, SpecificOperationBuilder } from "../";
import { NQuads } from "../../nquads";

export class PathPaymentOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();
    this.pushValue("send_max", this.body.sendMax().toString());
    this.pushValue("amount", this.body.destAmount().toString());
    this.pushLink("op.destination", AccountBuilder.keyFromXDR(this.body.destination()));
    this.pushBuilder(
      AssetBuilder.fromXDR(this.body.destAsset()),
      `${this.entityPrefix}.asset_destination`,
      "operations"
    );
    this.pushBuilder(AssetBuilder.fromXDR(this.body.sendAsset()), `${this.entityPrefix}.asset_source`, "operations");

    (this.body.path() as any[]).forEach(xdr => {
      this.pushBuilder(AssetBuilder.fromXDR(xdr), `${this.entityPrefix}.assets_path`, "operations");
    });

    return this.nquads;
  }

  protected get resultCode(): number | undefined {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.pathPaymentResult().switch().value;
  }

  @Memoize()
  protected get body(): any {
    return this.bodyXDR.pathPaymentOp();
  }

  private get entityPrefix() {
    return "path_payment_op";
  }
}
