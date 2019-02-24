import { DgraphClient, DgraphClientStub, ERR_ABORTED, Mutation, Operation } from "dgraph-js";
import fs from "fs";
import grpc from "grpc";
import { LedgerHeader, TransactionWithXDR } from "../model";
import logger from "../util/logger";
import { DGRAPH_QUERY_URL } from "../util/secrets";
import { Cache } from "./cache";
import { Ingestor } from "./ingestor";
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
      const res = vars ? await txn.queryWithVars(query, vars) : await txn.query(query);
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

  public async importLedger(header: LedgerHeader, transactions: TransactionWithXDR[]) {
    let nquads: NQuads = await Ingestor.ingestLedger(header, transactions);

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

  public async deleteOffers(offerIds: number[]): Promise<void> {
    if (offerIds.length === 0) {
      return;
    }

    const fetchUidsQuery = `{
      offers(func: eq(offer.id, [${offerIds.join(",")}])) {
        uid
      }
    }`;

    const response: { offers: Array<{ uid: string }> } = await this.query(fetchUidsQuery);
    const uids = response.offers.map(offer => offer.uid);

    const mu = new Mutation();

    mu.setDelNquads(uids.map((uid: string) => `<${uid}> * * .`).join("\n"));

    const txn = this.client.newTxn();
    await txn.mutate(mu);
    await txn.commit();
  }
}
