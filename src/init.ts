import * as Sentry from "@sentry/node";
import logger from "./util/logger";
import { SENTRY_DSN } from "./util/secrets";
import { setNetwork as setStellarNetwork } from "./util/stellar";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [new Sentry.Integrations.RewriteFrames({ root: __dirname || process.cwd() })]
  });
}

const network = setStellarNetwork();
logger.info(`Using ${network}`);
