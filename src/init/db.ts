import { createConnection } from "typeorm";
import { Account, AccountData, Offer, TrustLine } from "../orm/entities";
import { DATABASE_URL } from "../util/secrets";

export async function initDatabase() {
  return createConnection({
    type: "postgres",
    url: DATABASE_URL,
    entities: [Account, AccountData, Offer, TrustLine],
    synchronize: false,
    logging: process.env.DEBUG_SQL !== undefined
  });
}
