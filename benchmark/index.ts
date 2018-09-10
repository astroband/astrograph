import ws from "ws";
import { WebSocketLink } from "apollo-link-ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { gql } from "apollo-server";

const GRAPHQL_ENDPOINT = "ws://localhost:4000/graphql";

const client = new SubscriptionClient(`http://${GRAPHQL_ENDPOINT}`, undefined, ws);
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

const observable = apolloClient.subscribe({
  fetchPolicy: "network-only",
  query: SUBSCRIPTION,
  variables: {}
}).subscribe({
  next (data: any) {
    console.log(data);
  }
});

console.log(observable);

setTimeout(() => { console.log("Finished."); }, 20000);
