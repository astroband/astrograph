import { Connection } from "../connection";
import { Writer } from "./writer";

export abstract class WriterFactory {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public abstract async produce(): Promise<Writer>;
}
