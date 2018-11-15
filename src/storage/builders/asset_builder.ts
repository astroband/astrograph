import { makeKey } from "../../util/crypto";
import { IBlank, NQuad, NQuads } from "../nquads";
import { Builder } from "./builder";
import { Asset } from "stellar-sdk";
import { AccountBuilder } from "./account";

export class AssetBuilder extends Builder {
  public static key(asset: Asset) {
    return makeKey("asset", asset.isNative().toString(), asset.getCode(), asset.getIssuer() || "");
  }

  public readonly current: IBlank;

  constructor(private asset: Asset) {
    super();
    this.current = NQuad.blank(AssetBuilder.key(asset));
  }

  public build(): NQuads {
    const issuer = this.asset.getIssuer();

    this.pushKey();

    this.pushValue("type", "asset");
    this.pushValue("native", this.asset.isNative().toString());
    this.pushValue("code", this.asset.getCode());

    if (issuer) {
      this.pushBuilder(new AccountBuilder(issuer), "issuer", "assets.issued");
    }

    return this.nquads;
  }
}
