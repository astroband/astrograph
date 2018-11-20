import { DgraphClient, DgraphClientStub, ERR_ABORTED, Mutation, Operation } from "dgraph-js";
import grpc from "grpc";
import logger from "../util/logger";
import { DGRAPH_URL } from "../util/secrets";

import { LedgerBuilder } from "./builders/ledger";
import { OperationBuilder } from "./builders/operation";
import { TransactionBuilder } from "./builders/transaction";
import { Cache } from "./cache";

import { LedgerHeader, Transaction } from "../model";

const SCHEMA = `
  type: string @index(exact) .
  key: string @index(exact) .
  seq: int @index(int) .
  id: string @index(exact) .
  index: int @index(int) .
  order: string @index(exact) .
  code: string @index (exact) .
  native: bool @index (bool) .
  deleted: bool @index (bool) .
  kind: string @index(exact) .
  amount: int @index (int) .
  price: float @index (float) .
  starting_balance: int @index (int) .
  close_time: dateTime @index (hour) .
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
    op.setSchema(SCHEMA);
    await this.client.alter(op);
  }

  public async push(nquads: string): Promise<any> {
    const id = Math.floor(Math.random() * Math.floor(65536));

    logger.debug(`[DGraph] Transaction ${id} started...`);
    // logger.debug(nquads);

    const txn = this.client.newTxn();
    const mu = new Mutation();
    mu.setSetNquads(nquads);
    const assigns = await txn.mutate(mu);

    try {
      logger.debug(`[DGraph] Transaction ${id} commiting...`);
      await txn.commit();
      logger.debug(`[DGraph] Transaction ${id} commited!`);

      return assigns;
    } catch (err) {
      try {
        if (err === ERR_ABORTED) {
          logger.debug(`[DGraph] Transaction ${id} aborted, retrying...`);
          logger.debug(nquads);

          await txn.commit();
          return assigns;
        } else {
          throw err;
        }
      } catch (err) {
        await txn.discard();
        logger.error(err);
        logger.error(nquads);
        process.exit(-1);
      }
    }
  }

  public async query(query: string, vars?: any): Promise<any> {
    try {
      const txn = this.client.newTxn();
      const res = vars ? await txn.queryWithVars(query, vars) : await txn.query(query);
      return res.getJson();
    } catch (err) {
      logger.error(err);
      logger.error("Query:", { query });
      logger.error("Vars:", vars);
      return null;
    }
  }

  public async importLedgerTransactions(header: LedgerHeader, transactions: Transaction[]) {
    let nquads = new LedgerBuilder(header).build();

    for (const transaction of transactions) {
      nquads = nquads.concat(new TransactionBuilder(transaction).build());

      for (let index = 0; index < transaction.operationsXDR().length; index++) {
        nquads = nquads.concat(new OperationBuilder(transaction, index).build());
      }

      // nquads = nquads.concat(new TransactionResultBuilder(transaction).build());
    }

    const c = new Cache(this, nquads);
    nquads = await c.populate();

    const result = await this.push(nquads.join("\n"));
    c.put(result);
  }
}
