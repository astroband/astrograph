import ProgressBar from "progress";
import { Ingestor } from "./storage/ingestor";

import { configure, IConfig } from "./export/configure";
import iterate from "./export/iterate";
import logger from "./util/logger";

import { LedgerHeader, TransactionWithXDR } from "./model";

logger.info("DGraph live export script, yarn export <count> <seq>");

configure().then(async (config: IConfig) => {
  const bar = new ProgressBar("[:bar] :elapseds elapsed, eta :etas", { total: config.total });

  logger.info(`Exporting ${config.total} ledgers ${config.minSeq}/${config.maxSeq}`);

  await iterate(config.minSeq, config.maxSeq, async (header: LedgerHeader, transactions: TransactionWithXDR[]) => {
    const chunk = await Ingestor.ingestLedger(header, transactions);
    config.file.write(chunk.toString() + "\n");
    bar.tick();
  });

  config.file.end();
});
