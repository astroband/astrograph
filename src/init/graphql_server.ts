import { initDatabase } from "./db";
import { initSentry } from "./sentry";
import { updateBaseReserve } from "./stellar";

import { connect as connectPubSub } from "../pubsub";
import { initOffersGraph } from "../service/dex";
import "../util/asset";
import logger from "../util/logger";

export async function initGraphqlServer() {
  logger.info("Initializing...");

  logger.info("Sentry...");
  return initSentry()
    .then(() => logger.info("Connecting to the database..."))
    .then(initDatabase)
    .then(() => logger.info("Creating connection for pubsub..."))
    .then(connectPubSub)
    .then(() => logger.info("Updating base reserve value..."))
    .then(updateBaseReserve)
    .then(() => logger.info("Building offers graph for path finding..."))
    .then(initOffersGraph)
    .then(() => logger.info("Astrograph is initialized successfully"));
}
