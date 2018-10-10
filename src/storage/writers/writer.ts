import { AccountCache } from "../cache";
import { Connection } from "../connection";
import * as nquads from "../nquads";

export abstract class Writer {
  protected connection: Connection;
  protected accountCache: AccountCache;
  protected b: nquads.Builder;

  constructor(connection: Connection) {
    this.connection = connection;
    this.accountCache = new AccountCache(connection);
    this.b = new nquads.Builder();
  }

  public abstract async write(): Promise<nquads.Value>;

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
    const account = await this.accountCache.fetch(id);

    this.b.append(current, predicate, account);
    this.b.append(account, foreignKey, current);
  }
}
