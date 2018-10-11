import { Asset } from "../../model";
import { Connection } from "../connection";
import * as nquads from "../nquads";

export abstract class Writer {
  protected connection: Connection;
  protected b: nquads.Builder;

  constructor(connection: Connection) {
    this.connection = connection;
    this.b = new nquads.Builder();
  }

  public abstract async write(): Promise<nquads.Value>;
  protected abstract async loadContext(): Promise<void>;

  protected async push(key: string): Promise<nquads.Value | null> {
    const result = await this.connection.push(this.b.nquads);
    return nquads.UID.from(result.getUidsMap().get(key));
  }

  protected appendPrev(current: nquads.Value, prev: nquads.Value | null) {
    if (prev) {
      this.b.append(current, "prev", prev).append(prev, "next", current);
    }
  }

  protected async appendAccount(current: nquads.Value, predicate: string, id: string, foreignKey: string) {
    const account = await this.connection.store.account(id);

    this.b.append(current, predicate, account);
    this.b.append(account, foreignKey, current);
  }

  protected async appendAsset(current: nquads.Value, predicate: string, a: Asset, foreignKey: string) {
    const asset = await this.connection.store.asset(a);
    const issuer = await this.connection.store.account(a.issuer);

    this.b.append(current, predicate, asset);
    this.b.append(asset, foreignKey, current);
  }
}
