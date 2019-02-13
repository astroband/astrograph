import * as Sentry from "@sentry/node";

import { Cursor, Worker } from "./ingest";
import logger from "./util/logger";
import { DEBUG_LEDGER, INGEST_INTERVAL } from "./util/secrets";

Cursor.build(DEBUG_LEDGER).then(cursor => {
  logger.info(
    `Staring ingest every ${INGEST_INTERVAL} ms. from ${
      DEBUG_LEDGER === -1 ? "first ledger" : DEBUG_LEDGER || "lastest ledger"
    }`
  );

  const tick = async () => {
    const worker = new Worker(cursor);
    worker
      .run()
      .then(done => {
        logger.info(`Ledger ${cursor.current}: done.`);
        if (done) {
          tick();
        } else {
          setTimeout(tick, INGEST_INTERVAL);
        }
      })
      .catch(e => {
        logger.error(e);
        if (e.message.includes("Please retry again, server is not ready to accept requests")) {
          setTimeout(tick, 200);
          return;
        }

        Sentry.captureException(e);
      });
  };

  tick();
});
