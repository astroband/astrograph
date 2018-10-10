import { Connection } from "./connection";
import * as nquads from "./nquads";

import dig from "object-dig";

export abstract class Cache {
  private static cache: Map<string, nquads.Value> = new Map<string, nquads.Value>();
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async fetch(id: string): Promise<nquads.Value> {
    const cached = this.cache().get(id);

    if (cached) {
      return cached;
    }

    return this.findOrCreate(id);
  }

  private cache(): Map<string, nquads.Value> {
    return AccountCache.cache;
  }

  private async findOrCreate(id: string): Promise<nquads.Value> {
    const found = await this.find(id);

    if (found) {
      this.cache().set(id, found);
      return found;
    }

    return this.create(id);
  }

  private async find(id: string): Promise<nquads.Value | null> {
    const result = await queryFind(id);
    const found = nquads.UID.from(dig(result, "record", 0, "uid"));

    if (found) {
      this.cache().set(id, found);
    }

    return found;
  }

  protected queryFind(id: string): Promise<any> {
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

  private async create(id: string): Promise<nquads.Value> {
    const builder = new nquads.Builder();
    const account = new nquads.Blank("account");

    builder.append(account, "type", "account");
    builder.append(account, "id", id);

    const pushResult = await this.connection.push(builder.nquads);
    const uid = pushResult.getUidsMap().get("account");

    return new nquads.UID(uid);
  }
}
