import { NQuads } from "../../nquads";
import { AccountBuilder } from "../account";
import { AssetBuilder } from "../asset";
import { PathPaymentResultBuilder } from "../path_payment_result";
import { SpecificOperationBuilder } from "../specific_operation";

export class PathPaymentOpBuilder extends SpecificOperationBuilder {
  public build(): NQuads {
    super.build();
    this.pushValue("send_max", this.xdr.sendMax().toString());
    this.pushValue("dest_amount", this.xdr.destAmount().toString());
    this.pushBuilder(AccountBuilder.fromXDR(this.xdr.destination()), "account.destination", "operations");
    this.pushBuilder(AssetBuilder.fromXDR(this.xdr.destAsset()), "asset.destination", "operations");
    this.pushBuilder(AssetBuilder.fromXDR(this.xdr.sendAsset()), "asset.source", "operations");

    (this.xdr.path() as any[]).forEach(xdr => {
      this.pushBuilder(AssetBuilder.fromXDR(xdr), "assets.path", "operations");
    });

    return this.nquads;
  }

  protected pushResult() {
    const resultBuilder = new PathPaymentResultBuilder(this.current.value, this.trXDR.pathPaymentResult());

    this.pushBuilder(resultBuilder, "result");
  }
}
