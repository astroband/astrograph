import { Connection } from "../connection";
import * as nquads from "../nquads";
import { Query } from "./query";

export type IAccountQueryResult = nquads.UID | null;

export class AccountQuery extends Query<IAccountQueryResult> {
  private id: string;

  constructor(connection: Connection, id: string) {
    super(connection);
    this.id = id;
  }

  public async call(): Promise<IAccountQueryResult> {
    const r = await this.request();
    return this.digUID(r, "current", 0, "uid");
  }

  protected async request(): Promise<any> {
    return this.connection.query(
      `
        query account($id: string) {
          current(func: eq(type, "account")) @filter(eq(id, $id)) {
            uid
          }
        }
      `,
      { $id: this.id }
    );
  }
}
