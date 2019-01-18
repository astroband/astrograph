import { Asset } from "stellar-sdk";
import { makeKey } from "../../util/crypto";
import { NETWORK_MASTER_KEY } from "../../util/stellar";
import { IBlank, NQuad, NQuads } from "../nquads";
import { AccountBuilder } from "./account";
import { Builder } from "./";

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

    this.pushKey();

    this.pushValue("asset", "");
    this.pushValue("type", "asset");
    this.pushValue("native", this.asset.isNative().toString());
    this.pushValue("code", this.asset.getCode());

    this.pushBuilder(new AccountBuilder(issuer), "issuer", "assets.issued");

    return this.nquads;
  }
}
