import * as Integrations from "@sentry/integrations";
import * as Sentry from "@sentry/node";
import { createConnection, getRepository } from "typeorm";
import { Account, AccountData, Offer, TrustLine } from "./orm/entities";
import "./util/asset";
import { buildOffersGraph } from "./util/graph/graph";
import logger from "./util/logger";
import "./util/memo";
import * as secrets from "./util/secrets";
import { setNetwork as setStellarNetwork, updateBaseReserve } from "./util/stellar";

export default async function init(): Promise<void> {
  if (secrets.SENTRY_DSN) {
    Sentry.init({
      dsn: secrets.SENTRY_DSN,
      integrations: [new Integrations.RewriteFrames({ root: __dirname || process.cwd() })]
    });
  }

  const network = setStellarNetwork();
  logger.info(`Using ${network}`);

  logger.info("Updating base reserve value...");
  const baseReserve = await updateBaseReserve();
  logger.info(`Current base reserve value is ${baseReserve}`);

  logger.info("Connecting to database...");
  await createConnection({
    type: "postgres",
    host: secrets.DBHOST,
    port: secrets.DBPORT,
    username: secrets.DBUSER,
    password: secrets.DBPASSWORD,
    database: secrets.DB,
    entities: [Account, AccountData, Offer, TrustLine],
    synchronize: false,
    logging: process.env.DEBUG_SQL !== undefined
  });

  logger.info("Building offers graph for path finding...");
  const offers = await getRepository(Offer).find();
  await buildOffersGraph(offers);

  logger.info("Astrograph is ready!");
}
