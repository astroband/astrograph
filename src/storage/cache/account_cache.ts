import { Cache } from "./cache";
import * as nquads from "../nquads";

export class AccountCache extends Cache<string> {
  protected async query(key: string): Promise<any> {
    return this.connection.query(
      `
        query record($id: string) {
          record(func: eq(type, "account")) @filter(eq(id, $id)) {
            uid
          }
        }
      `,
      { $id: key }
    );
  }

  protected build(key: string): nquads.Builder {
    const builder = new nquads.Builder();
    const account = new nquads.Blank("account");

    builder.for(account).append("type", "account").append("id", key);

    return builder;
  }
}
