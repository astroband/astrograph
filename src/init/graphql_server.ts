import { getRepository } from "typeorm";
import { Offer } from "../orm/entities/offer";
import { connect as connectPubSub } from "../pubsub";
import { buildOffersGraph } from "../service/dex";
import "../util/asset";
import logger from "../util/logger";
import "../util/memo";
import { initDatabase } from "./db";
import { initSentry } from "./sentry";
import { setStellarNetwork, updateBaseReserve } from "./stellar";

export async function initGraphqlServer() {
  logger.info("Initializing...");

  logger.info("Sentry...");
  return initSentry()
    .then(() => logger.info("Setting Stellar network..."))
    .then(setStellarNetwork)
    .then(network => logger.info(`Astrograph will use the network with passphrase "${network}"`))
    .then(() => logger.info("Connecting to the database..."))
    .then(initDatabase)
    .then(() => logger.info("Creating connection for pubsub..."))
    .then(connectPubSub)
    .then(() => logger.info("Updating base reserve value..."))
    .then(updateBaseReserve)
    .then(() => logger.info("Building offers graph for path finding..."))
    .then(async () => {
      const offers = await getRepository(Offer).find();
      await buildOffersGraph(offers);
    })
    .then(() => logger.info("Astrograph is inialized successfully"));
}
