import * as Integrations from "@sentry/integrations";
import * as Sentry from "@sentry/node";
import { SENTRY_DSN } from "../util/secrets";

export function initSentry(): Promise<boolean> {
  if (!SENTRY_DSN) {
    return Promise.resolve(false);
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      new Integrations.RewriteFrames({
        root: __dirname ? `${__dirname}/../..` : process.cwd()
      })
    ]
  });

  return Promise.resolve(true);
}
