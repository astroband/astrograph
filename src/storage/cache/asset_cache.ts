import { Asset } from "../../model";
import * as nquads from "../nquads";
import { Cache } from "./cache";

const cache = new Map<Asset, nquads.Value>();

export class AssetCache extends Cache<Asset> {
  protected cache(): Map<Asset, nquads.Value> {
    return cache;
  }

  protected async query(key: Asset): Promise<any> {
    return this.connection.query(
      `
        query record($native: boolean, $code: string, $issuer: string) {
          record(func: eq(type, "asset")) @filter(eq(native, $native) AND eq(code, $code) AND eq(issuer, $issuer)) {
            uid
          }
        }
      `,
      { $native: key.native, $code: key.code, $issuer: key.issuer }
    );
  }

  protected build(key: Asset): nquads.Builder {
    const builder = new nquads.Builder();
    const asset = new nquads.Blank("asset");

    builder
      .for(asset)
      .append("type", "asset")
      .append("native", key.native)
      .append("code", key.code)
      .append("issuer", key.issuer);

    return builder;
  }
}
