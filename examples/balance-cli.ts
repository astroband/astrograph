// Prints account balances for all assets.
// Run: yarn exec ts-node examples/balance-cli.ts <ACCOUNT ID> [<ASTROGRAPH URL>]

import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { gql } from "apollo-server";
import fetch from "node-fetch";

import { ACCOUNT_ID, GRAPHQL_ENDPOINT } from "./args";

const link = createHttpLink({ uri: GRAPHQL_ENDPOINT, fetch });
const cache = new InMemoryCache();
const client = new ApolloClient({ link, cache });

console.log("Account ID:", ACCOUNT_ID);

client
  .query({
    query: gql`
      query balances($id: AccountID!) {
        account(id: $id) {
          balances {
            balance
            limit
            asset {
              code
              issuer { id }
            }
          }
        }
      }
    `,
    variables: {
      id: ACCOUNT_ID
    }
  })
  .then((result: { data: any }) => {
    for (const t of result.data.account.balances) {
      console.log("Balance", t.balance, t.id, "with limit", t.limit);
    }
  });
