import { getManager } from "typeorm";
import { db } from "../database";
import { connect as connectPubSub } from "../pubsub";
import "../util/asset";
import logger from "../util/logger";
import { STELLAR_CORE_CURSOR_NAME } from "../util/secrets";
import { initDatabase } from "./db";
import { initSentry } from "./sentry";

export async function initIngestd() {
  logger.info("Initializing...");

  logger.info("Sentry...");
  return initSentry()
    .then(network => logger.info(`Astrograph will use ${network}`))
    .then(() => logger.info("Connecting to the database..."))
    .then(initDatabase)
    .catch((e: Error) => {
      logger.error(`Failed to connect to the database: ${e.message}`);
      process.exit(1);
    })
    .then(() => logger.info("Setting cursor..."))
    .then(async () => {
      const cursorValue = await db.ledgerHeaders.findMaxSeq();
      return getManager().query("INSERT INTO pubsub (resid, lastread) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
        STELLAR_CORE_CURSOR_NAME,
        cursorValue
      ]);
    })
    .then(() => logger.info("Creating connection for pubsub..."))
    .then(connectPubSub)
    .then(() => logger.info("Ingest daemon is inialized successfully"));
}
