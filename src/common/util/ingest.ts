import { Cursor, Fetcher } from "../../ingest";
import { Publisher } from "../../pubsub";
import logger from "./logger";
import { DEBUG_LEDGER, INGEST_INTERVAL } from "./secrets";

export default async function startIngest() {
  logger.info(
    `Staring ingest every ${INGEST_INTERVAL} ms. from ${
      DEBUG_LEDGER === -1 ? "first ledger" : DEBUG_LEDGER || "lastest ledger"
    }`
  );

  const cursor = await Cursor.build(DEBUG_LEDGER);

  const tick = async () => {
    const { ledger } = await cursor.nextLedger();

    if (ledger) {
      logger.info(`Ingesting ledger ${ledger.seq}`);

      const fetcher = new Fetcher(ledger);
      const collection = await fetcher.fetch();

      new Publisher(ledger, collection).publish();
    }
  };

  setInterval(tick, INGEST_INTERVAL);
}
