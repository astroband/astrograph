import { ApolloServer } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { Client as pgClient } from "pg";
import { Network } from "stellar-base";
import { createConnection, getConnection } from "typeorm";
import { initDatabase } from "../../src/init/db";
import { Account, AccountData, Asset, LedgerHeader, Offer, TrustLine } from "../../src/orm/entities";
import { pubsub } from "../../src/pubsub";
import schema from "../../src/schema";
import logger from "../../src/util/logger";
import { DATABASE_URL } from "../../src/util/secrets";

Network.useTestNetwork();

const server = new ApolloServer({ schema });

const queryServer = createTestClient(server).query;

const testCases = ["Assets", "Single account query", "Ledgers"];

// FIXME: for some reason using raw sql query from typeorm
// breaks fixture loading, so we have to use a workaround with pg client
const db = new pgClient({ connectionString: DATABASE_URL });

async function importDbDump() {
  const sql = fs.readFileSync(path.join(__dirname, "test_db.sql"), "utf8");
  logger.log("info", "importing database fixture...");
  await db.query(sql);
}

describe("Integration tests", () => {
  beforeAll(async () => {
    try {
      await createConnection({
        type: "postgres",
        url: DATABASE_URL,
        entities: [Account, AccountData, Asset, LedgerHeader, Offer, TrustLine],
        synchronize: false,
        logging: process.env.DEBUG_SQL !== undefined
      });
      db.connect();
      await importDbDump();
    } catch (e) {
      const dbNotExistMessageRegexp = /database "(\w+)" does not exist/;

      if (!dbNotExistMessageRegexp.test(e.message)) {
        throw e;
      }

      const dbName = e.message.match(dbNotExistMessageRegexp)[1];

      logger.log("info", `${e.message}. Creating...`);
      execSync(`createdb ${dbName}`);
      await importDbDump();
    }
  });

  afterAll(() => {
    getConnection().close();
    db.end();
  });

  test.each(testCases)("%s", async (caseName: string) => {
    const queryFile = caseName.toLowerCase().replace(/ /g, "_");
    const query = fs.readFileSync(`${__dirname}/integration_queries/${queryFile}.gql`, "utf8");

    const response = await queryServer({ query });

    expect(response.data).toMatchSnapshot();
  });
});
