import { Keypair } from "stellar-base";
import { NATIVE_ASSET_CODE } from "../util/stellar";
import { assetFromXDR } from "../util/xdr/asset";

export class Asset {
  public static buildNative(): Asset {
    return new Asset(true, NATIVE_ASSET_CODE, Keypair.master().publicKey());
  }

  public static build(assettype: string, assetcode: string, issuer: string) {
    if (assetcode === "") {
      return Asset.buildNative();
    }

    return new Asset(false, assetcode, issuer);
  }

  public static buildFromXDR(xdr: any): Asset {
    const { assettype, assetcode, issuer } = assetFromXDR(xdr);
    return Asset.build(assettype, assetcode, issuer);
  }

  public native: boolean; // NOTE: Need to figure out how to work with enum relations
  public code: string;
  public issuer: string;

  constructor(native: boolean, code: string, issuer: string) {
    this.native = native;
    this.code = code;
    this.issuer = issuer;
  }
}
