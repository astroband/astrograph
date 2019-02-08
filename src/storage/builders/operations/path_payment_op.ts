import { AccountBuilder, AssetBuilder, PathPaymentResultBuilder, SpecificOperationBuilder } from "../";
import { IBlank, NQuads } from "../../nquads";

export class PathPaymentOpBuilder extends SpecificOperationBuilder {
  private baseKey: any[];

  constructor(public readonly current: IBlank, protected xdr: any, protected resultXDR: any, baseKey: any[]) {
    super(current, xdr, resultXDR);

    this.baseKey = baseKey;
  }

  public build(): NQuads {
    super.build();
    this.pushValue("send_max", this.xdr.sendMax().toString());
    this.pushValue("amount", this.xdr.destAmount().toString());
    this.pushBuilder(AccountBuilder.fromXDR(this.xdr.destination()), "op.destination");
    this.pushBuilder(
      AssetBuilder.fromXDR(this.xdr.destAsset()),
      `${this.entityPrefix}.asset_destination`,
      "operations"
    );
    this.pushBuilder(AssetBuilder.fromXDR(this.xdr.sendAsset()), `${this.entityPrefix}.asset_source`, "operations");

    (this.xdr.path() as any[]).forEach(xdr => {
      this.pushBuilder(AssetBuilder.fromXDR(xdr), "path_payment_op.assets_path", "operations");
    });

    return this.nquads;
  }

  protected pushResult() {
    const resultBuilder = new PathPaymentResultBuilder(this.baseKey, this.trXDR.pathPaymentResult());

    this.pushBuilder(resultBuilder, "result");
  }

  private get entityPrefix() {
    return "path_payment_op";
  }
}
