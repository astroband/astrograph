import { IBlank, NQuads } from "../../nquads";
import { AccountBuilder, AssetBuilder, PathPaymentResultBuilder, SpecificOperationBuilder } from "../";

export class PathPaymentOpBuilder extends SpecificOperationBuilder {
  private baseKey: any[];

  constructor(public readonly current: IBlank, protected xdr: any, protected resultXDR: any, baseKey: any[]) {
    super(current, xdr, resultXDR);

    this.baseKey = baseKey;
  }

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
    const resultBuilder = new PathPaymentResultBuilder(this.baseKey, this.trXDR.pathPaymentResult());

    this.pushBuilder(resultBuilder, "result");
  }
}
