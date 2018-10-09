import { Connection } from "./connection";
import * as nquads from "./nquads";

export class AccountCache {
  private static cache: Map<string, nquads.IValue> = new Map<string, nquads.IValue>();
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async fetch(id: string): Promise<string> {
    const cached = this.cache().get(id);

    if (cached) {
      return cached.value;
    }

    return this.findOrCreate(id);
  }

  private cache(): Map<string, nquads.IValue> {
    return AccountCache.cache;
  }

  private async findOrCreate(id: string): Promise<string> {
    const found = await this.find(id);

    if (found) {
      this.cache().set(id, found);
      return found.value;
    }

    return this.create(id);
  }

  private async find(id: string): Promise<nquads.IValue | null> {
    const result = await this.connection.query(
      `
        query account($id: string) {
          account(func: eq(type, "account")) @filter(eq(id, $id)) {
            uid
          }
        }
      `,
      { $id: id }
    );

    if (result.account && result.account[0]) {
      const created = new nquads.UID(result.account[0].uid);
      this.cache().set(id, created);
      return created;
    }

    return null;
  }

  private async create(id: string): Promise<string> {
    const builder = new nquads.Builder();
    const account = new nquads.Blank("account");

    builder.append(account, "type", "account");
    builder.append(account, "id", id);

    const pushResult = await this.connection.push(builder.nquads);
    const uid = pushResult.getUidsMap().get("account");

    return new nquads.UID(uid).value;
  }
}
