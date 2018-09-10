import ws from "ws";
import { WebSocketLink } from "apollo-link-ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { gql } from "apollo-server";

const GRAPHQL_ENDPOINT = "localhost:4000";

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

client.onError((error) => console.log("Error!", error.target));

const observable = apolloClient.subscribe({
  fetchPolicy: "network-only",
  query: SUBSCRIPTION,
  variables: {
    args: {}
  }
}).subscribe({
  next (data: any) {
    console.log(data);
  }
});

console.log(observable);

setTimeout(() => { console.log("Finished."); }, 20000);
