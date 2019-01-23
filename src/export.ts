import ProgressBar from "progress";

import { configure, IConfig } from "./export/configure";
import iterate from "./export/iterate";
import logger from "./util/logger";

import { LedgerHeader } from "./model";

configure().then(async (config: IConfig) => {
  const bar = new ProgressBar("[:bar] :elapseds elapsed, eta :etas", { total: config.total });

  logger.info(`Exporting ${config.total} ledgers ${config.minSeq}/${config.maxSeq}`);

  await iterate(config.minSeq, config.maxSeq, (header: LedgerHeader | null) => {
    if (!header) {
      throw new Error("Ledger header is null");
    }

    config.gzip.ledger.write(`${header.ledgerSeq},${header.ledgerSeq},${header.ledgerSeq},0,0,0,0\n`);
    config.gzip.ledgerR.write(`${header.ledgerSeq},${header.ledgerSeq-1},PREV\n`);
    bar.tick();
  });

  config.gzip.ledger.end();
  config.gzip.ledgerR.end();
});

// import parseArgv from "minimist";
// import zlib from "zlib";
// import { db } from "./database";
// import { Cursor } from "./ingest/cursor";
// import logger from "./util/logger";
// import { setNetwork as setStellarNetwork } from "./util/stellar";
//
// let startSeq: number | null;
// let endSeq: number | null;
//
// logger.info("Neo4j csv export script.");
//
// // const args = parseArgv(process.argv.slice(2));
// // [startSeq, endSeq] = args;
// //
// // const network = setStellarNetwork();
// // logger.info(`Using ${network}`);
// //
// // const gzips = {
// //   ledger: zlib.createGzip()
// // };
// //
// // // const files = {
// // //   ledger: gzips.ledger.pipe(fs.createWriteStream("../export/ledgers.csv.gz"))
// // // };
// //
// // Cursor.build(startSeq || -1).then(async cursor => {
// //   if (endSeq == null) {
// //     endSeq = await db.ledgerHeaders.findMaxSeq();
// //   }
// //
// //   startSeq = cursor.current;
// //
// //   let data = await cursor.nextLedger();
// //   console.time("Import");
// //
// //   while (data) {
// //     const { header, transactions } = data;
// //     console.log(transactions.length);
// //
// //     if (header.ledgerSeq > endSeq!) {
// //       return;
// //     }
// //
// //     logger.info(`Ingesting ledger ${header.ledgerSeq}...`);
// //     logger.info(
// //       `Done! ${endSeq! - header.ledgerSeq} ledgers left (${(header.ledgerSeq - startSeq + 1) / (endSeq! - startSeq + 1) * 100}% complete)`
// //     );
// //     console.timeLog("Import");
// //
// //     data = await cursor.nextLedger();
// //   }
// //
// //   console.timeEnd("Import");
// //
// //   gzips.ledger.end();
// // })
// // .catch(err => {
// //   logger.error(err);
// //   process.exit(-1);
// // });
// //
// // function parseArgs(): [number | null, number | null] {
// //   const args = parseArgv(process.argv.slice(2));
// //   const { start = null, end = null } = args;
// //
// //   if (start && !Number.isInteger(start)) {
// //     throw new Error("Start seq number must be an integer!");
// //   }
// //
// //   if (end && !Number.isInteger(end)) {
// //     throw new Error("End seq number must be an integer!");
// //   }
// //
// //   if (start && end && start > end) {
// //     throw new Error("Start seq number is greater than the end!");
// //   }
// //
// //   return [start, end];
// // }
