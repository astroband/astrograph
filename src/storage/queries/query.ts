import { Dgraph } from "../dgraph";

export abstract class Query<R> {
  protected connection: Dgraph;

  constructor(connection: Dgraph) {
    this.connection = connection;
  }

  public abstract async call(): Promise<R>;
  protected abstract async request(): Promise<any>;
}
