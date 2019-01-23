import { DgraphClient, DgraphClientStub, ERR_ABORTED, Mutation, Operation } from "dgraph-js";
import grpc from "grpc";
import { LedgerHeader, TransactionWithXDR } from "../model";
import logger from "../util/logger";
import { DGRAPH_URL } from "../util/secrets";
import { Cache } from "./cache";
import { Ingestor } from "./ingestor";
import { NQuads } from "./nquads";

const SCHEMA = `
  type: string @index(hash) .
  key: string @index(hash) .
  seq: int @index(int) .
  id: string @index(exact) .
  index: int @index(int) .
  order: int @index(int) .
  code: string @index (exact) .
  native: bool @index (bool) .
  deleted: bool @index (bool) .
  kind: string @index(hash) .
  amount: int @index (int) .
  price: float @index (float) .
  starting_balance: int @index (int) .
  close_time: dateTime @index (hour) .
  authorize: bool @index (bool) .
  asset_code: string @index (exact) .
  bump_to: int @index (int) .
  limit: int @index (int) .
  name: string @index (exact) .
  value: string @index (exact) .
  offer_id: string @index (exact) .
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

  public async push(nquads: string | any[]): Promise<any> {
    const start = Date.now();

    const txn = this.client.newTxn();
    const mu = new Mutation();
    const payload: string = Array.isArray(nquads) ? nquads.join("\n") : nquads;
    mu.setSetNquads(payload);
    const assigns = await txn.mutate(mu);

    try {
      await txn.commit();
      const eta = Date.now() - start;

      logger.debug(`[DGraph] Transaction commited, ${nquads.length} triples, took ${eta/100} s.`);

      return assigns;
    } catch (err) {
      try {
        if (err === ERR_ABORTED) {
          logger.debug(`[DGraph] Transaction aborted, retrying...`);
          logger.debug(payload);

          await txn.commit();
          return assigns;
        } else {
          throw err;
        }
      } catch (err) {
        await txn.discard();
        logger.error(err);
        logger.error(payload);
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

  public async importLedger(header: LedgerHeader, transactions: TransactionWithXDR[]) {
    let nquads: NQuads = await Ingestor.ingestLedger(header, transactions);

    const cache = new Cache(this, nquads);
    nquads = await cache.populate();

    const result = await this.push(nquads);
    cache.put(result);
  }
}
