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

export const DATABASE_URL = process.env.DATABASE_URL || "";

export const PORT = Number.parseInt(process.env.PORT || "4000", 10);
export const BIND_ADDRESS = process.env.BIND_ADDRESS || "0.0.0.0";

export const DEBUG_LEDGER = Number.parseInt(process.env.DEBUG_LEDGER || "", 10);
export const INGEST_INTERVAL = Number.parseInt(process.env.INGEST_INTERVAL || "", 10) || 2000;

export const STELLAR_NETWORK = process.env.STELLAR_NETWORK || "pubnet";
export const HORIZON_ENDPOINT = process.env.HORIZON_ENDPOINT;

if (!["pubnet", "testnet"].includes(STELLAR_NETWORK) && !HORIZON_ENDPOINT) {
  throw new Error("If you use private network, you must provide HORIZON_ENDPOINT env variable");
}

export const SENTRY_DSN = process.env.SENTRY_DSN;

export const ELASTIC_URL = process.env.ELASTIC_URL || "http://localhost:9200";

export const STELLAR_CORE_CURSOR_NAME = process.env.STELLAR_CORE_CURSOR_NAME || "ASTROGRAPH";
