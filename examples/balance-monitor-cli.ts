// Live monitoring of specified account.
// Run: yarn exec ts-node examples/balance-monitor-cli.ts <ACCOUNT ID> [<ASTROGRAPH URL>]

import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";
import { gql } from "apollo-server";
import { SubscriptionClient } from "subscriptions-transport-ws";
import ws from "ws";

import { ACCOUNT_ID } from "./args";

const client = new SubscriptionClient("ws://localhost:4000/graphql", { reconnect: true }, ws);

const link = new WebSocketLink(client);
const cache = new InMemoryCache();
const apolloClient = new ApolloClient({ link, cache });

console.log("Connecting to GraphQL...");
console.log("Account ID:", ACCOUNT_ID);

const SUBSCRIPTION = gql`
  subscription trustLine($args: EventInput!) {
    trustLine(args: $args) {
      accountID
      values {
        asset {
          code
          issuer { id }
          native
        }
        balance
        limit
        authorized
      }
    }
  }
`;

client.onError(error => console.log("An error occured!", error.target));

apolloClient
  .subscribe({
    fetchPolicy: "network-only",
    query: SUBSCRIPTION,
    variables: {
      args: {
        idEq: ACCOUNT_ID
      }
    }
  })
  .subscribe({
    next(data: any) {
      const values = data.data.trustLine.values;
      const assetId = values.asset.native ? values.asset.code : `${values.asset.code}-${values.asset.issuer.id}`;

      console.log(
        "New balance for",
        assetId,
        "is now",
        values.balance,
        "with limit",
        values.limit,
        values.authorized ? "and authorization" : "without authorization"
      );
    }
  });

// setTimeout(() => { console.log("Finished.", eventCount, "events received."); }, 10000);
