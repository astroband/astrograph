// Run with: yarn bench

import ws from "ws";
import { WebSocketLink } from "apollo-link-ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { gql } from "apollo-server";

const GRAPHQL_ENDPOINT = "localhost:4000/graphql";

const client = new SubscriptionClient(`ws://${GRAPHQL_ENDPOINT}`, { reconnect: true }, ws);

const link = new WebSocketLink(client);
const cache = new InMemoryCache();
const apolloClient = new ApolloClient({ link, cache });

console.log("Connecting to GraphQL...");

const SUBSCRIPTION = gql`
  subscription account($args: EventInput!) {
    account(args: $args) {
      id
      values {
        sequenceNumber
        thresholds {
          low
          medium
          high
        }
      }
    }
  }`;

client.onError((error) => console.log("An error occured!", error.target));

let eventCount = 0;

for (let n = 0; n < 7000; n++) {
  apolloClient.subscribe({
    fetchPolicy: "network-only",
    query: SUBSCRIPTION,
    variables: {
      args: {}
    }
  }).subscribe({
    next (data: any) {
      eventCount += 1;
    }
  });
}

setTimeout(() => { console.log("Finished.", eventCount, "events received."); }, 10000);
