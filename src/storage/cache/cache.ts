import { Connection } from "./connection";
import * as nquads from "./nquads";

import dig from "object-dig";

export abstract class Cache<T> {
  private static cache: Map<T, nquads.Value> = new Map<T, nquads.Value>();
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async fetch(key: T): Promise<nquads.Value> {
    const cached = this.cache().get(key);

    if (cached) {
      return cached;
    }

    return this.find(key);// || this.create(key);
  }

  private cache(): Map<string, nquads.Value> {
    return AccountCache.cache;
  }

  private async find(id: T): Promise<nquads.Value | null> {
    const found = await this.query(id);

    if (found) {
      this.cache().set(id, found);
      return found;
    }

    return null;
  }

  protected query(id: T): Promise<any> {
    return this.connection.query(
      `
        query record($id: string) {
          record(func: eq(type, "account")) @filter(eq(id, $id)) {
            uid
          }
        }
      `,
      { $id: id }
    );
  }

  // protected async create(id: string): Promise<nquads.Value> {
  //   const builder = new nquads.Builder();
  //   const account = new nquads.Blank("account");
  //
  //   builder.append(account, "type", "account");
  //   builder.append(account, "id", id);
  //
  //   const pushResult = await this.connection.push(builder.nquads);
  //   return nquads.UID.from(pushResult.getUidsMap().get("account"));
  // }
}
