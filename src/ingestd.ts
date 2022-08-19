import * as Sentry from "@sentry/node";
import { Cursor, Worker } from "./ingest";
import { initIngestd as init } from "./init";
import logger from "./util/logger";
import { DEBUG_LEDGER, INGEST_INTERVAL } from "./util/secrets";

init().then(async () => {
  const cursor = await Cursor.build(DEBUG_LEDGER);

  logger.info(
    `Staring ingest every ${INGEST_INTERVAL} ms. from ${
      DEBUG_LEDGER === -1 ? "first ledger" : DEBUG_LEDGER || "lastest ledger"
    }`
  );

  const tick = async () => {
    const worker = new Worker(cursor);

    try {
      const done = await worker.run();

      if (done) {
        logger.info(`Ledger ${cursor.current}: done.`);
        tick();
      } else {
        setTimeout(tick, INGEST_INTERVAL);
      }
    } catch (e) {
      logger.error(e as any);
      Sentry.captureException(e);
      setTimeout(tick, 200);
    }
  };

  tick();
});
