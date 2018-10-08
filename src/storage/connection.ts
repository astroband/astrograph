import { DgraphClient, DgraphClientStub, Mutation, Operation } from "dgraph-js";
import grpc from "grpc";
import logger from "../util/logger";
import { DGRAPH_URL } from "../util/secrets";

const schema = `
  type: string @index(exact) .
  seq: int @index(int) .
  id: string @index(exact) .
  index: int @index(int) .
  sortHandle: string @index(exact) .
  sourceAccountID: string @index(exact) .
  kind: string @index(exact) .
`;

export class Connection {
  private stub: any;
  private client: any;

  constructor() {
    this.stub = new DgraphClientStub(DGRAPH_URL, grpc.credentials.createInsecure());
    this.client = new DgraphClient(this.stub);
  }

  public close() {
    this.stub.close();
  }

  public async migrate() {
    const op = new Operation();
    op.setSchema(schema);
    await this.client.alter(op);
  }

  public async push(nquads: string): Promise<any> {
    const txn = this.client.newTxn();

    try {
      const mu = new Mutation();
      mu.setSetNquads(nquads);
      const assigns = await txn.mutate(mu);
      await txn.commit();

      return assigns;
    } catch (err) {
      await txn.discard();
      logger.error(err);
      process.exit(-1);
    }
  }

  public async query(query: string, vars: any): Promise<any> {
    const res = await this.client.newTxn().queryWithVars(query, vars);
    return res.getJson();
  }
}
