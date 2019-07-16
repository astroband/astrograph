import { createConnection } from "typeorm";
import * as secrets from "../util/secrets";

export async function initDatabase() {
  return createConnection({
    type: "postgres",
    host: secrets.DBHOST,
    port: secrets.DBPORT,
    username: secrets.DBUSER,
    password: secrets.DBPASSWORD,
    database: secrets.DB,
    entities: ["./src/orm/entities/*.ts"],
    synchronize: false,
    logging: process.env.DEBUG_SQL !== undefined
  });
}
