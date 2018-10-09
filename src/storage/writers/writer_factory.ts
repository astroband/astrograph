import { Connection } from "../connection";
import { Writer } from "./writer";

import * as nquads from "../nquads";

export abstract class WriterFactory {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public abstract async produce(): Writer;
}
