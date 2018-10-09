import { AccountCache } from "../account_cache";
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

  public abstract async write(): Promise<nquads.IValue>;

  protected newOrUID(subject: any, name: string) {
    return subject && (subject.uid || subject[0]) ? `<${subject.uid || subject[0].uid}>` : `_:${name}`;
  }

  protected walk(data: any, fn: any): string | null {
    if (!data) {
      return null;
    }

    const { leaf, result } = fn(data);

    if (result) {
      return result;
    }

    if (leaf) {
      return this.walk(leaf, fn);
    }

    return null;
  }
}
