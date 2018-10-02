import { DgraphClient, DgraphClientStub, Operation } from "dgraph-js";
import grpc from "grpc";
import { DGRAPH_URL } from "../util/secrets";

const schema = `
  type: string @index(exact) .
  seq: int @index(int) .
  id: string @index(exact) .
`;

export class Connection {
  private stub: any;
  private client: any;

  constructor() {
    this.stub = new DgraphClientStub(DGRAPH_URL, grpc.credentials.createInsecure());
    this.client = new DgraphClient(this.stub);
  }

  public close() {
    this.client.close();
  }

  public async migrate() {
    const op = new Operation();
    op.setSchema(schema);
    await this.client.alter(op);
  }
}

// private transactions: Transaction[];
//
// constructor(transactions: Transaction[]) {
//   this.stub = new DgraphClientStub(DGRAPH_URL, grpc.credentials.createInsecure());
//   this.client = new DgraphClient(this.stub());
//   this.transactions = transactions;
// }
