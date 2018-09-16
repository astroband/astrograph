import dotenv from "dotenv";
import fs from "fs";
import logger from "./logger";

if (fs.existsSync(".env")) {
  logger.log("info", "Using .env file to supply config environment variables");
  dotenv.config({ path: ".env" });
} else {
  logger.emerg("NO ENV DEFINED");
}

export const DB = process.env.DB || "stellar";
export const DBPORT = Number.parseInt(process.env.DBPORT || "5432", 10);
export const DBHOST = process.env.DBHOST;
export const DBUSER = process.env.DBUSER || "stellar";
export const DBPASSWORD = process.env.DBPASSWORD || "";

export const DEBUG_LEDGER = Number.parseInt(process.env.DEBUG_LEDGER || "", 10);
export const INGEST_INTERVAL = Number.parseInt(process.env.INGEST_INTERVAL || "", 10) || 2000;

export const HORIZON_URL = process.env.HORIZON_URL || "https://horizon-testnet.stellar.org";
