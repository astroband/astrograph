import * as Integrations from "@sentry/integrations";
import * as Sentry from "@sentry/node";
import { createConnection } from "typeorm";
import { Account, AccountData, Offer } from "./orm/entities";
import "./util/asset";
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

  await updateBaseReserve();
  await createConnection({
    type: "postgres",
    host: secrets.DBHOST,
    port: secrets.DBPORT,
    username: secrets.DBUSER,
    password: secrets.DBPASSWORD,
    database: secrets.DB,
    entities: [Account, AccountData, Offer],
    synchronize: false,
    logging: process.env.DEBUG_SQL !== undefined
  });
}
