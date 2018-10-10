import { Connection } from "../connection";
import * as nquads from "../nquads";

import dig from "object-dig";

export abstract class Cache<T> {
  protected connection: Connection;
  private cache: Map<T, nquads.Value> = new Map<T, nquads.Value>();

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async fetch(key: T): Promise<nquads.Value> {
    const cached = this.cache.get(key);

    if (cached) {
      console.log("CACHE HIT:", cached);
      return cached;
    }

    return (await this.find(key)) || (await this.create(key));
  }

  protected async create(key: T): Promise<nquads.Value> {
    const pushResult = await this.connection.push(this.build(key).nquads);
    const map = pushResult.getUidsMap();
    const uids = Array.from(map.values());

    return new nquads.UID(uids[0].toString());
  }

  protected abstract async query(key: T): Promise<any>;
  protected abstract build(key: T): nquads.Builder;

  private async find(id: T): Promise<nquads.Value | null> {
    const result = await this.query(id);
    const found = nquads.UID.from(dig(result, "record", 0, "uid"));

    if (found) {
      this.cache.set(id, found);
      console.log("FOUND:", found);
      return found;
    }

    return null;
  }
}
