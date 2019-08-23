import { createConnection } from "typeorm";
import { Account, AccountData, Offer, TrustLine } from "../orm/entities";
import { DATABASE_URL } from "../util/secrets";

export async function initDatabase() {
  const queryStart = DATABASE_URL.indexOf("?");

  const connectionString = (queryStart !== -1) ?  DATABASE_URL.slice(0, queryStart) : DATABASE_URL;

  return createConnection({
    type: "postgres",
    url: connectionString,
    entities: [Account, AccountData, Offer, TrustLine],
    synchronize: false,
    logging: process.env.DEBUG_SQL !== undefined
  });
}
