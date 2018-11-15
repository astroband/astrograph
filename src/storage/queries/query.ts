import { Connection } from "../connection";

export abstract class Query<R> {
  protected connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public abstract async call(): Promise<R>;
  protected abstract async request(): Promise<any>;
}
