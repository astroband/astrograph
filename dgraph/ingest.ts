import parseArgv from "minimist";
import { DgraphIngestor as Ingestor } from "../src/ingest";
import { Cursor, ICursorResult } from "../src/ingest/cursor";
import { Connection } from "../src/storage";
import logger from "../src/util/logger";
import { DGRAPH_URL } from "../src/util/secrets";
import { setNetwork as setStellarNetwork } from "../src/util/stellar";

if (!DGRAPH_URL) {
  logger.error("Please, provide DGRAPH_URL env variable");
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
const ingestor = new Ingestor(c);

setStellarNetwork().then((network: string) => {
  logger.info(`Using ${network}`);

  c.migrate()
    .then(async () => {
      Cursor.build(startSeq || -1).then(async cursor => {
        let data: ICursorResult | null;

        while (data = await cursor.nextLedger()) {
          const { header, transactions } = data;

          if (endSeq && header.ledgerSeq > endSeq) {
            break;
          }

          logger.info(`ingesting ledger #${header.ledgerSeq}`);
          await ingestor.ingestLedger(header, transactions);
        }

        c.close();
      });
    })
    .catch(err => {
      logger.error(err);
      process.exit(-1);
    });
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
