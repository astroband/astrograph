import { Connection } from "../connection";
import * as nquads from "../nquads";
import { Query } from "./query";

export class Account extends Query<nquads.UID | null> {
  private id: string;

  constructor(connection: Connection, id: string) {
    super(connection);
    this.id = id;
  }

  protected async call(): Promise<any> {
    return this.connection.query(
      `
        query account($id: string) {
          account(func: eq(type, "account")) @filter(eq(id, $id)) {
            uid
          }
        }
      `,
      { $id: this.id }
    );
  }

  public async results() {
    const r = await this.call();
    return this.digUID(r, "account", 0, "uid");
  }
}
