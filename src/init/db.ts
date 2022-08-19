import { dataSource } from "../database";
import logger from "../util/logger";

export async function initDatabase() {
  try {
    await dataSource.initialize();
    logger.debug("Initialized ORM data source");
  } catch (err) {
    logger.error(`Error connecting to ORM data source: ${err}`);
  }
}
