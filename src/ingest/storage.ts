import { DgraphClientStub, DgraphClient, Operation } from "dgraph-js";
import grpc from "grpc";
import { Transaction } from "../model";
import { DGRAPH_URL } from "../common/util/secrets";

const schema = `
  name: string @index(exact) .
  age: int .
  married: bool .
  loc: geo .
  dob: datetime .
`;

export class Storage {
  private stub: any;
  private client: any;

  constructor(transactions: Transaction[]) {
    this.stub = new DgraphClientStub(DGRAPH_URL, grpc.credentials.createInsecure());
    this.client = new DgraphClient(this.stub());
  }

  public close() {
    this.client.close();
  }

  public async setSchema() {
    const op = new Operation();
    op.setSchema(schema);
    await this.client.alter(op);
  }
}
