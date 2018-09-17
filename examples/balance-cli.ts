// Prints account balances for all assets.
// Run: yarn exec ts-node examples/balance-cli.ts <ACCOUNT ID> [<ASTROGRAPH URL>]

import { createHttpLink } from "apollo-link-http";
import fetch from "node-fetch";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { gql } from "apollo-server";

import { ACCOUNT_ID, GRAPHQL_ENDPOINT } from "./args";

const link = createHttpLink({ uri: `http://${GRAPHQL_ENDPOINT}`, fetch });
const cache = new InMemoryCache();
const client = new ApolloClient({ link, cache });

console.log("Account ID:", ACCOUNT_ID);

client.query({
  query: gql`
    query trustLines($id: AccountID!) {
      trustLines(id: $id) {
        balance
        limit
        asset {
          code
          native
        }
      }
    }
  `,
  variables: {
    id: ACCOUNT_ID
  }
}).then((result: { data: any }) => {
  for (const t of result.data.trustLines) {
    console.log("Balance", t.balance, t.asset.code, "with limit", t.limit);
  }
});
