import { Connection } from "../connection";

import dig from "object-dig";
import * as nquads from "../nquads";

export abstract class Query<R> {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public abstract async call(): Promise<R>;
  protected abstract async request(): Promise<any>;

  protected digUID(r: any, ...args: any[]): nquads.UID | null {
    return nquads.UID.from(dig(r, ...args));
  }
}
