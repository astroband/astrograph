import { Connection } from "../connection";

export abstract class Writer {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  protected async prevNextCurrent(vars: any): Promise<any> {
    const result = await this.connection.query(this.prevNextCurrentQuery(), vars);
    const current = result.current[0];
    const prev = result.prev[0];
    const next = result.next[0];

    return { prev, next, current };
  }

  protected abstract prevNextCurrentQuery(): string;
}
