import { Asset } from "stellar-sdk";
import { AccountBuilder, AssetBuilder, SpecificOperationBuilder } from "../";
import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { IBlank, NQuads } from "../../nquads";

export class AllowTrustOpBuilder extends SpecificOperationBuilder {
  // FIXME: adding `source` only for this operation is a dirty hack
  constructor(
    public readonly current: IBlank,
    protected xdr: any,
    public readonly source: string,
    protected resultXDR: any
  ) {
    super(current, xdr, resultXDR);
  }

  public build(): NQuads {
    super.build();

    const id = publicKeyFromBuffer(this.xdr.trustor().value());
    const assetCode = this.xdr
      .asset()
      .value()
      .toString()
      .replace(/\0/g, "");
    const asset = new Asset(assetCode, this.source);

    this.pushBuilder(new AccountBuilder(id), "allow_trust_op.trustor");
    this.pushBuilder(new AssetBuilder(asset), "allow_trust_op.asset", "operations");
    this.pushValue("authorize", this.xdr.authorize());

    return this.nquads;
  }

  protected get resultCode() {
    if (!this.trXDR) {
      return;
    }

    return this.trXDR.allowTrustResult().switch().value;
  }
}
