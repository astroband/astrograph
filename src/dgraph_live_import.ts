// NOTE: OBSOLETE
import fs from "fs";
import parseArgv from "minimist";
import zlib from "zlib";
import { db } from "./database";
import { Cursor } from "./ingest/cursor";
import { Cache } from "./storage/cache";
import { Connection } from "./storage/connection";
import { Ingestor } from "./storage/ingestor";
import { NQuads } from "./storage/nquads";
import logger from "./util/logger";
import "./util/memo";
import { DGRAPH_QUERY_URL } from "./util/secrets";
import { setNetwork as setStellarNetwork } from "./util/stellar";

if (!DGRAPH_QUERY_URL) {
  logger.error("Please, provide DGRAPH_INGEST_URL or DGRAPH_URL env variable");
  process.exit(-1);
}

let startSeq: number | null;
let endSeq: number | null;

try {
  [startSeq, endSeq] = parseArgs();
} catch (e) {
  logger.error(e);
  process.exit(-1);
}

const c = new Connection();

const network = setStellarNetwork();
logger.info(`Using ${network}`);

c.migrate()
  .then(async () => {
    if (endSeq == null) {
      endSeq = await db.ledgerHeaders.findMaxSeq();
    }

    Cursor.build(startSeq || -1).then(async cursor => {
      startSeq = cursor.current;

      let data = await cursor.nextLedger();
      const file = fs.createWriteStream("./nquads.txt.gz");
      const gzip = zlib.createGzip();

      gzip.pipe(file);

      console.time("Import");

      while (data) {
        const { header, transactions } = data;

        if (header.ledgerSeq > endSeq!) {
          return;
        }

        logger.info(`Ingesting ledger ${header.ledgerSeq}...`);

        let nquads: NQuads = await Ingestor.ingestLedger(header, transactions);

        const cache = new Cache(c, nquads);

        nquads = await cache.populate();

        gzip.write(nquads.join("\n"));
        gzip.write("\n");

        logger.info(
          `Done! ${endSeq! - header.ledgerSeq} ledgers left (${((header.ledgerSeq - startSeq + 1) /
            (endSeq! - startSeq + 1)) *
            100}% complete)`
        );
        console.timeLog("Import");

        data = await cursor.nextLedger();
      }

      console.timeEnd("Import");

      gzip.end();
    });
  })
  .catch(err => {
    logger.error(err);
    process.exit(-1);
  });

function parseArgs(): [number | null, number | null] {
  const args = parseArgv(process.argv.slice(2));
  const { start = null, end = null } = args;

  if (start && !Number.isInteger(start)) {
    throw new Error("Start seq number must be an integer!");
  }

  if (end && !Number.isInteger(end)) {
    throw new Error("End seq number must be an integer!");
  }

  if (start && end && start > end) {
    throw new Error("Start seq number is greater than the end!");
  }

  return [start, end];
}
