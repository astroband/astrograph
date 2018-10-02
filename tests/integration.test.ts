import db from "../src/database";
import schema from "../src/schema";
import fs from "fs";
import { graphql } from "graphql";
import { Network } from "stellar-base";
import { QueryFile } from "pg-promise";
import path from "path";

Network.useTestNetwork();

const testCases = [
  "Single account query",
  "Accounts signed by",
  "Data entries",
  "Signers",
  "Ledgers",
  "Trust lines",
];

const dbDump = new QueryFile(path.join(__dirname, "test_db.sql"));

// FIXME: This is a hack, because
// jest's beforeAll somehow is messed
// up with async dump loading
(async () => {
  await db.query(dbDump);
})();

describe("Integration tests", () => {
  test.each(testCases)("%s", async (caseName: string) => {
    const queryFile = caseName.toLowerCase().replace(/ /g, "_");
    const query = fs.readFileSync(`${__dirname}/integration_queries/${queryFile}.gql`, "utf8");

    const { data } = await graphql(schema, query);

    expect(data).toMatchSnapshot();
  });
});
