import schema from "../src/schema";
import fs from "fs";
import { graphql } from "graphql";
import { Network } from "stellar-base";

Network.useTestNetwork();

const testCases = [
  "Single account query",
];

for (const testCaseName of testCases) {
  test(testCaseName, async () => {
    const queryFile = testCaseName.toLowerCase().replace(/ /g, "_");
    const query = fs.readFileSync(`${__dirname}/integration_queries/${queryFile}.gql`, "utf8");

    const { data } = await graphql(schema, query);

    expect(data).toMatchSnapshot();
  });
}
