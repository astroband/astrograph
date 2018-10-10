import { Connection } from "../connection";
import * as nquads from "../nquads";

import dig from "object-dig";

export abstract class Cache<T> {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async fetch(key: T): Promise<nquads.Value> {
    const cached = this.cache().get(key);

    if (cached) {
      return cached;
    }

    return (await this.find(key)) || this.create(key);
  }

  protected async create(key: T): Promise<nquads.Value> {
    const pushResult = await this.connection.push(this.build(key).nquads);
    const map = pushResult.getUidsMap();
    const uids = Array.from(map.values());

    return new nquads.UID(uids[0].toString());
  }

  protected abstract async query(key: T): Promise<any>;
  protected abstract build(key: T): nquads.Builder;
  protected abstract cache(): Map<T, nquads.Value>;

  private async find(id: T): Promise<nquads.Value | null> {
    const result = await this.query(id);
    const found = nquads.UID.from(dig(result, "record", 0, "uid"));

    if (found) {
      this.cache().set(id, found);
      return found;
    }

    return null;
  }
}
