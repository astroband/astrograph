import { Connection } from "../connection";

export class Writer {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }
}
