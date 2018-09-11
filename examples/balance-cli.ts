// Run: yarn exec ts-node examples/balance-cli.ts <ACCOUNT ID> [<ASTROGRAPH URL>]

// import { HttpLink } from "apollo-link-http";
// import { SubscriptionClient } from "subscriptions-transport-ws";
// import { InMemoryCache } from "apollo-cache-inmemory";
// import ApolloClient from "apollo-client";
import { gql } from "apollo-server";

import { ACCOUNT_ID, GRAPHQL_ENDPOINT } from "./args";

client.query({
  query: gql`
    query trustlines($id: AccountID!) {
      trustlines(id: $id) {
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
});

// const
//
// const client = new SubscriptionClient(`ws://${GRAPHQL_ENDPOINT}`, { reconnect: true }, ws);
//
// const link = new WebSocketLink(client);
// const cache = new InMemoryCache();
// const apolloClient = new ApolloClient({ link, cache });
//
// console.log("Connecting to GraphQL...");
//
// const SUBSCRIPTION = gql`
//   subscription account($args: EventInput!) {
//     account(args: $args) {
//       id
//       values {
//         sequenceNumber
//         thresholds {
//           low
//           medium
//           high
//         }
//       }
//     }
//   }`;
//
// client.onError((error) => console.log("An error occured!", error.target));
//
// let eventCount = 0;
//
// for (let n = 0; n < 7000; n++) {
//   apolloClient.subscribe({
//     fetchPolicy: "network-only",
//     query: SUBSCRIPTION,
//     variables: {
//       args: {}
//     }
//   }).subscribe({
//     next (data: any) {
//       eventCount += 1;
//     }
//   });
// }
//
// setTimeout(() => { console.log("Finished.", eventCount, "events received."); }, 10000);
