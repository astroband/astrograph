import { Asset } from "stellar-sdk";
import { Connection } from "../connection";
import * as nquads from "../nquads";
import { Query } from "./query";

export type IAssetQueryResult = nquads.UID | null;

export class AssetQuery extends Query<IAssetQueryResult> {
  private asset: Asset;

  constructor(connection: Connection, asset: Asset) {
    super(connection);
    this.asset = asset;
  }

  public async call(): Promise<IAssetQueryResult> {
    const r = await this.request();
    return this.digUID(r, "asset", 0, "uid");
  }

  protected async request(): Promise<any> {
    const asset = this.asset;

    return this.connection.query(
      `
        query record($native: string, $code: string, $issuer: string) {
          val(func: eq(type, "account")) @filter(eq(id, $issuer)) {
            id AS uid
          }

          asset(func: eq(type, "asset")) @filter(eq(native, $native) AND eq(code, $code)) @cascade {
            uid @filter(uid(id))
          }
        }
      `,
      {
        $native: asset.isNative().toString(),
        $code: asset.getCode(),
        $issuer: asset.getIssuer()
      }
    );
  }
}
