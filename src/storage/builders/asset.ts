import { Asset } from "../../model";
import { makeKey } from "../../util/crypto";
import { NETWORK_MASTER_KEY } from "../../util/stellar";
import { IBlank, NQuad, NQuads } from "../nquads";
import { Builder } from "./";
import { AccountBuilder } from "./account";

export class AssetBuilder extends Builder {
  public static fromXDR(xdr: any) {
    return new AssetBuilder(Asset.fromOperation(xdr));
  }

  public static key(asset: Asset) {
    return makeKey("asset", asset.isNative().toString(), asset.getCode(), asset.getIssuer() || "");
  }

  public readonly current: IBlank;

  constructor(private asset: Asset) {
    super();
    this.current = NQuad.blank(AssetBuilder.key(asset));
  }

  public build(): NQuads {
    const issuer = this.asset.getIssuer() || NETWORK_MASTER_KEY;
    const code = this.asset.getCode();

    this.pushKey();

    this.pushValue("asset.id", this.asset.toString());
    this.pushValue("code", code);
    this.pushValue("native", this.asset.isNative().toString());

    this.pushLink("asset.issuer", AccountBuilder.key(issuer));

    return this.nquads;
  }
}
