import parseArgs from "minimist";
import { DgraphIngestor as Ingestor } from "../src/ingest";
import { Cursor, ICursorResult } from "../src/ingest/cursor";
import { Connection } from "../src/storage";
import logger from "../src/util/logger";
import { DGRAPH_URL } from "../src/util/secrets";
import { setNetwork as setStellarNetwork } from "../src/util/stellar";

if (!DGRAPH_URL) {
  logger.error("No dgraph url");
  process.exit(-1);
}

const args = parseArgs(process.argv.slice(2));
const { startSeq = null, endSeq = null } = args;

if (startSeq && endSeq && startSeq > endSeq) {
  logger.error("Start seq number is greater than the end!");
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

        while ((data = await cursor.nextLedger())) {
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
