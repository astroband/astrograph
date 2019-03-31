import dotenv from "dotenv";
import fs from "fs";
import logger from "./logger";

const environment = process.env.NODE_ENV;
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env";

if (fs.existsSync(envFile)) {
  logger.log("info", `Using ${envFile} file to supply config environment variables`);
  dotenv.config({ path: envFile });
} else if (environment === "test" && !process.env.CI) {
  throw new Error("No .env file found for the test environment. Create `.env.test` file with necessary settings");
}

export const DB = process.env.DB || "stellar";
export const DBPORT = Number.parseInt(process.env.DBPORT || "5432", 10);
export const DBHOST = process.env.DBHOST;
export const DBUSER = process.env.DBUSER || "stellar";
export const DBPASSWORD = process.env.DBPASSWORD || "";

export const PORT = Number.parseInt(process.env.PORT || "4000", 10);
export const BIND_ADDRESS = process.env.BIND_ADDRESS || "0.0.0.0";

export const DEBUG_LEDGER = Number.parseInt(process.env.DEBUG_LEDGER || "", 10);
export const INGEST_INTERVAL = Number.parseInt(process.env.INGEST_INTERVAL || "", 10) || 2000;

export const DGRAPH_QUERY_URL = process.env.DGRAPH_QUERY_URL || process.env.DGRAPH_URL;
export const DGRAPH_INGEST_URL = process.env.DGRAPH_INGEST_URL || process.env.DGRAPH_URL;

export const STELLAR_NETWORK = process.env.STELLAR_NETWORK || "pubnet";
export const SENTRY_DSN = process.env.SENTRY_DSN;
