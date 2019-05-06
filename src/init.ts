import * as Sentry from "@sentry/node";
import "./util/asset";
import logger from "./util/logger";
import "./util/memo";
import { SENTRY_DSN } from "./util/secrets";
import { setNetwork as setStellarNetwork, updateBaseReserve } from "./util/stellar";

export default async function init(): Promise<void> {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [new Sentry.Integrations.RewriteFrames({ root: __dirname || process.cwd() })]
    });
  }

  const network = setStellarNetwork();
  logger.info(`Using ${network}`);

  await updateBaseReserve();
}
