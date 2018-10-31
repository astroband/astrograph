import { Asset } from "../../model";
import { Connection } from "../connection";
import { Writer } from "./writer";

import * as nquads from "../nquads";

export class AssetWriter extends Writer {
  public static async build(connection: Connection, asset: Asset): Promise<AssetWriter> {
    const writer = new AssetWriter(connection, asset);
    await writer.loadContext();
    return writer;
  }

  private asset: Asset;

  private current: nquads.Value;
  private issuer: nquads.Value;

  protected constructor(connection: Connection, asset: Asset) {
    super(connection);

    this.asset = asset;
    this.current = new nquads.Blank("asset");
    this.issuer = new nquads.Blank("issuer");
  }

  public async write(): Promise<nquads.Value> {
    this.b
      .for(this.current)
      .append("type", "asset")
      .append("native", this.asset.native)
      // we need to truncate null bytes to avoid breaking DGraph
      // see https://github.com/dgraph-io/dgraph/issues/2662
      .append("code", this.asset.code.replace(/\0/g, ""))
      .append("issuer", this.issuer);

    const created = await this.push("asset");
    return created || this.current;
  }

  protected async loadContext() {
    const current = await this.connection.repo.asset(this.asset);

    this.current = current || this.current;
    this.issuer = await this.connection.store.account(this.asset.issuer);
  }
}
