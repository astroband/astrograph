import fs from "fs";
import ProgressBar from "progress";
import zlib from "zlib";
import { configure, IConfig } from "./export/configure";
import iterate from "./export/iterate";
import { Ingestor } from "./storage/ingestor";
import { SCHEMA } from "./storage/schema";
import logger from "./util/logger";

import { LedgerHeader, TransactionWithXDR } from "./model";

logger.info("DGraph live export script, yarn export <count> <seq>");

configure()
  .then(async (config: IConfig) => {
    const bar = new ProgressBar("[:bar] :elapseds elapsed, eta :etas", { total: config.total });

    logger.info(`Exporting ${config.total} ledgers ${config.minSeq}/${config.maxSeq}`);

    const buildSliceFileName = (sliceNum: number) => {
      const { minSeq, maxSeq, sliceSize } = config;
      const sliceStart = minSeq + sliceNum * sliceSize;
      let sliceEnd = minSeq + (sliceNum + 1) * sliceSize - 1;

      if (sliceEnd > maxSeq) {
        sliceEnd = maxSeq;
      }

      return `${config.dirPath}/${sliceStart}-${sliceEnd}.rdf.gz`;
    };

    let ledgerCounter = 0;
    let sliceCounter = -1;
    let file = zlib.createGzip();

    await iterate(config.minSeq, config.maxSeq, async (header: LedgerHeader, transactions: TransactionWithXDR[]) => {
      if (ledgerCounter % config.sliceSize === 0) {
        file.end();
        file = zlib.createGzip();

        sliceCounter += 1;
        file.pipe(fs.createWriteStream(buildSliceFileName(sliceCounter)));
      }

      const chunk = await Ingestor.ingestLedger(header, transactions, { ingestOffers: true });
      file.write(chunk.toString() + "\n");

      ledgerCounter += 1;
      bar.tick();
    });

    file.end();

    fs.writeFileSync(`${config.dirPath}/export.schema`, SCHEMA.replace(/^\s*\n/gm, "").replace(/^\s\s/gm, ""));
  })
  .catch(err => {
    logger.error(err);
  });
