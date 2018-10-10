import { Connection } from "../connection";

import * as nquads from "../nquads";
import dig from "object-dig";

export abstract class Query<R> {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  protected abstract async request(): Promise<any>;
  public abstract async call(): Promise<R>;

  protected digUID(r: any, ...args: any[]): nquads.UID | null {
    return nquads.UID.from(dig(r, ...args));
  }
}
