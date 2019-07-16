import "../util/asset";
import logger from "../util/logger";
import { initDatabase } from "./db";
import { initSentry } from "./sentry";
import { setStellarNetwork } from "./stellar";

export async function initIngestd() {
  logger.info("Initializing...");

  logger.info("Sentry...");
  return initSentry()
    .then(() => logger.info("Setting Stellar network..."))
    .then(setStellarNetwork)
    .then(network => logger.info(`Astrograph will use ${network}`))
    .then(() => logger.info("Connecting to the database..."))
    .then(initDatabase)
    .then(() => logger.info("Ingest daemon is inialized successfully"));
}
