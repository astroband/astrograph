import { Cursor, SubscriptionPayloadCollection } from "../../ingest";
import { Publisher } from "../../pubsub";
import logger from "./logger";
import { DEBUG_LEDGER, INGEST_INTERVAL } from "./secrets";
import { DGraph } from "../../ingest";

export default async function startIngest() {
  logger.info(
    `Staring ingest every ${INGEST_INTERVAL} ms. from ${
      DEBUG_LEDGER === -1 ? "first ledger" : DEBUG_LEDGER || "lastest ledger"
    }`
  );

  const cursor = await Cursor.build(DEBUG_LEDGER);

  const tick = async () => {
    const result = await cursor.nextLedger();

    if (result) {
      const { ledger, transactions } = result;

      logger.info(`Ingesting ledger ${ledger.seq}`);

      const collection = new SubscriptionPayloadCollection(transactions);
      new Publisher(ledger, collection).publish();
      new DGraph(ledger, transactions, collection).ingest();
    }
  };

  setInterval(tick, INGEST_INTERVAL);
}
