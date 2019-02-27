import { DgraphClient, DgraphClientStub, ERR_ABORTED, Mutation, Operation } from "dgraph-js";
import fs from "fs";
import grpc from "grpc";
import { LedgerHeader, TransactionWithXDR } from "../model";
import logger from "../util/logger";
import { DGRAPH_QUERY_URL } from "../util/secrets";
import { Cache } from "./cache";
import { IIngestOpts, Ingestor } from "./ingestor";
import { NQuads } from "./nquads";
import { SCHEMA } from "./schema";

export class Connection {
  private stub: any;
  private client: any;

  constructor(endpointUrl?: string) {
    this.stub = new DgraphClientStub(endpointUrl || DGRAPH_QUERY_URL, grpc.credentials.createInsecure());

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

      logger.debug(`[DGraph] Transaction commited, ${nquads.length} triples, took ${eta / 1000} s.`);

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
      const start = Date.now();

      const txn = this.client.newTxn();
      const res = await txn.queryWithVars(query, vars);
      const eta = Date.now() - start;

      logger.debug(`[DGraph] Query, took ${eta / 1000} s.`);

      return res.getJson();
    } catch (err) {
      logger.error(err);
      logger.error("Query:", { query });
      logger.error("Vars:", vars);
      return null;
    }
  }

  public async importLedger(
    header: LedgerHeader,
    transactions: TransactionWithXDR[],
    opts: IIngestOpts
  ): Promise<void> {
    let nquads: NQuads = await Ingestor.ingestLedger(header, transactions, opts);

    if (nquads.length === 0) {
      return;
    }

    const cache = new Cache(this, nquads);
    nquads = await cache.populate();
    const payload = nquads.compact();

    if (process.env.DEBUG_DUMP_LEDGERS) {
      const fn = `tmp/${header.ledgerSeq}.txt`;
      fs.writeFile(fn, payload.join("\n"), err => {
        if (err) {
          throw err;
        }
        logger.info(`[DEBUG] Ledger dumped to ${fn}`);
      });
    }

    const result = await this.push(payload);
    cache.put(result);
  }

  // Deletes all predicates from nodes with given properties,
  //
  // e.g. given { offer_id: [1, 2], account_id: [ 3, 4] } deletes
  // nodes with offer_id equals 1 or 2, and nodes with account_id equals 3 or 4
  // For each predicate in args separate transaction is created, so delete
  // mutations will run concurrently
  public async deleteByPredicates(args: { [predicate: string]: Array<string | number> }) {
    const handler = async (predicate: string, values: Array<string | number>) => {
      if (values.length === 0) {
        return;
      }

      const txn = this.client.newTxn();

      const response = await txn.query(`{
        nodes(func: eq(${predicate}, [${values.join(",")}])) {
          uid
        }
      }`);
      const uids = response.getJson().nodes.map((node: { uid: string }) => node.uid);

      if (uids.length === 0) {
        return;
      }

      const mu = new Mutation();
      mu.setCommitNow(true);

      mu.setDelNquads(uids.map((uid: string) => `<${uid}> * * .`).join("\n"));

      await txn.mutate(mu);
    };

    const promises = Object.entries(args).map(arg => handler(...arg));

    return Promise.all(promises);
  }
}
