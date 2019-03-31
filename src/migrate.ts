import { Connection } from "./storage/connection";
import logger from "./util/logger";
import { DGRAPH_QUERY_URL } from "./util/secrets";

if (!DGRAPH_QUERY_URL) {
  logger.info("Please, provide DGRAPH_URL or DGRAPH_QUERY_URL env variables to migrate schema");
  process.exit(0);
}

logger.info(`Updating schema on ${DGRAPH_QUERY_URL} node...`);

new Connection().migrate().catch((err: any) => {
  logger.error(err);
  process.exit(-1);
});
