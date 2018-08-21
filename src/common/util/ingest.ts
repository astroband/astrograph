import { Collection, Ingestor, Publisher } from "../../ingest";
import { Ledger } from "../../model";
import logger from "./logger";
import { DEBUG_LEDGER, INGEST_INTERVAL } from "./secrets";

export default async function startIngest() {
  const ingest = await Ingestor.build(DEBUG_LEDGER, (ledger: Ledger, collection: Collection) => {
    new Publisher(ledger, collection).publish();
  });

  logger.info(`Staring ingest every ${INGEST_INTERVAL} ms.`);

  setInterval(() => ingest.tick(), INGEST_INTERVAL);
}
