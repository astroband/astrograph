import { Connection } from "../connection";
import { Writer } from "./writer";

import * as nquads from "../nquads";

export class AccountWriter extends Writer {
  public static async build(connection: Connection, id: string): Promise<AccountWriter> {
    const writer = new AccountWriter(connection, id);
    await writer.loadContext();
    return writer;
  }

  private id: string;
  private current: nquads.Value;

  protected constructor(connection: Connection, id: string) {
    super(connection);
    this.id = id;
    this.current = new nquads.Blank(`account_${id}`);
  }

  public async write(): Promise<nquads.Value> {
    this.b
      .for(this.current)
      .append("type", "account")
      .append("id", this.id);

    const created = await this.push(`account_${this.id}`);
    return created || this.current;
  }

  protected async loadContext() {
    const current = await this.connection.repo.account(this.id);
    this.current = current || this.current;
  }
}
