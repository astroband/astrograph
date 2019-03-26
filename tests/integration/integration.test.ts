import { execSync } from "child_process";
import fs from "fs";
import { graphql } from "graphql";
import path from "path";
import { Client as dbClient } from "pg";
import { Network } from "stellar-base";
import schema from "../../src/schema";
import logger from "../../src/util/logger";
import * as secrets from "../../src/util/secrets";

Network.useTestNetwork();

const testCases = [
  "Assets",
  "Single account query",
  "Ledgers"
];

async function importDbDump() {
  const client = new dbClient({
    host: secrets.DBHOST,
    port: secrets.DBPORT,
    database: secrets.DB,
    user: secrets.DBUSER,
    password: secrets.DBPASSWORD
  });

  const sql = fs.readFileSync(path.join(__dirname, "test_db.sql"), "utf8");

  await client.connect();

  logger.log("info", "importing database fixture...");

  await client.query(sql);
  await client.end();
}

describe("Integration tests", () => {
  beforeAll(async () => {
    try {
      await importDbDump();
    } catch (e) {
      if (e.message !== `database "${secrets.DB}" does not exist`) {
        throw e;
      }

      logger.log("info", `${e.message}. Creating...`);
      execSync(`createdb ${secrets.DB}`);
      await importDbDump();
    }
  });

  test.each(testCases)("%s", async (caseName: string) => {
    const queryFile = caseName.toLowerCase().replace(/ /g, "_");
    const query = fs.readFileSync(`${__dirname}/integration_queries/${queryFile}.gql`, "utf8");

    const { data } = await graphql(schema, query);

    expect(data).toMatchSnapshot();
  });
});
