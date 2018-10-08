import { Connection } from "./connection";

export class AccountCache {
  private static cache: Map<string, string> = new Map<string, string>();
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async fetch(id: string): Promise<string> {
    const cached = this.cache().get(id);

    if (cached) {
      return cached;
    }

    return this.findOrCreate(id);
  }

  private cache(): Map<string, string> {
    return AccountCache.cache;
  }

  private async findOrCreate(id: string): Promise<string> {
    const found = await this.find(id);

    if (found) {
      this.cache().set(id, found);
      return found;
    }

    return this.create(id);
  }

  private async find(id: string): Promise<string | null> {
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
      const created = result.account[0].uid;
      this.cache().set(id, created);
      return `<${created}>`;
    }

    return null;
  }

  private async create(id: string): Promise<string> {
    const pushResult = await this.connection.push(
      `
        _:account <type> "account" .
        _:account <id> "${id}" .
      `
    );

    const uid = pushResult.getUidsMap().get("account");

    return `<${uid}>`;
  }
}
