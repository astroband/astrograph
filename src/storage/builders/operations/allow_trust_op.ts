import { Asset } from "stellar-sdk";
import { AccountBuilder, AssetBuilder, SpecificOperationBuilder } from "../";
import { publicKeyFromBuffer } from "../../../util/xdr/account";
import { IBlank, NQuads } from "../../nquads";

export class AllowTrustOpBuilder extends SpecificOperationBuilder {
  // FIXME: adding `source` only for this operation is a dirty hack
  constructor(
    public readonly current: IBlank,
    public readonly source: string,
    protected xdr: any,
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

  protected pushResult() {
    const code = this.trXDR.allowTrustResult().switch().value;
    this.pushValue("allow_trust_op.result_code", code);
  }
}
