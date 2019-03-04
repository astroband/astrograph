import fs from "fs";
import { SCHEMA } from "./storage/schema";
import logger from "./util/logger";

const fileName = "dgraph.schema";
fs.writeFileSync(fileName, SCHEMA.replace(/^\s*\n/gm, ""));

logger.info(`DGraph schema was dumped to ${fileName}`);
