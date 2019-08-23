// Live monitoring of specified account.
// Run: yarn exec ts-node examples/balance-monitor-cli.ts <ACCOUNT ID> [<ASTROGRAPH URL>]

import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";
import { gql } from "apollo-server";
import { SubscriptionClient } from "subscriptions-transport-ws";
import ws from "ws";
import { MutationType } from "../src/model";

import { ACCOUNT_ID, GRAPHQL_ENDPOINT } from "./args";

const client = new SubscriptionClient(GRAPHQL_ENDPOINT, { reconnect: true }, ws);

const link = new WebSocketLink(client);
const cache = new InMemoryCache();
const apolloClient = new ApolloClient({ link, cache });

console.log("Connecting to GraphQL...");
console.log("Account ID:", ACCOUNT_ID);

const SUBSCRIPTION = gql`
  subscription balance($args: EventInput!) {
    balance(args: $args) {
      account {
        id
      }
      mutationType
      asset {
        id
        code
        issuer { id }
      }
      values {
        asset {
          id
          code
          issuer { id }
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
      const payload = data.data.balance;

      if (payload.mutationType === MutationType.Remove) {
        console.log(`Trustline for ${payload.asset.code}-${payload.asset.issuer.id} is removed`);
        return;
      }

      const values = payload.values;

      console.log(
        "New balance for",
        values.asset.id,
        "is now",
        values.balance,
        "with limit",
        values.limit,
        values.authorized ? "and authorization" : "without authorization"
      );
    }
  });

// setTimeout(() => { console.log("Finished.", eventCount, "events received."); }, 10000);
