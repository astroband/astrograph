// Live monitoring of best trade offers for specified asset pair
// Run: yarn exec ts-node examples/tick.ts

import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";
import { gql } from "apollo-server";
import { SubscriptionClient } from "subscriptions-transport-ws";
import ws from "ws";
import { Query } from "pg";

// That's our Astrograph public instance URL, "wss" protocol used for "secure web socket",
// websocket over https.
const GRAPHQL_ENDPOINT = "wss://astrograph.evilmartians.io/graphql"

// Here is first asset: code and issuer account delimited by "-". We use this form of passing assets
// everywhere.
const SELLING = "USD-GBSTRUSD7IRX73RQZBL3RQUH6KS3O4NYFY3QCALDLZD77XMZOPWAVTUK"

// Stellar Lumens
const BUYING = "native"

// We use Apollo Server to communicate with Astrograph. Here we establish connection to server
// using web socket transport as it supports subscriptions.
const client = new SubscriptionClient(GRAPHQL_ENDPOINT, { reconnect: true, timeout: 60000 }, ws);
const link = new WebSocketLink(client);
const cache = new InMemoryCache();
const apolloClient = new ApolloClient({ link, cache });

console.log(`Connecting to GraphQL at ${GRAPHQL_ENDPOINT}...`);
console.log(`Assets: ${SELLING}/${BUYING}`)

// Here is the query we use to get initial state for pair in question. It runs 
// once on server start.
const QUERY = gql`
query tick($selling: AssetID!, $buying: AssetID!) {
  tick(selling: $selling, buying: $buying) {
    bestBid
    bestAsk
  }
}
`;

apolloClient
  .query({
    query: QUERY,
    variables: {
      selling: SELLING,
      buying: BUYING
    }
  })
  .then((result: { data: any }) => {
    const tick = result.data.tick;
    console.log(`Current values BID/ASK ${tick.bestBid}/${tick.bestAsk}`);
  });

const SUBSCRIPTION = gql`
  subscription tick($selling: AssetID!, $buying: AssetID!) {
    tick(
      selling: $selling, 
      buying: $buying
    ) {
      bestBid
      bestAsk
    }    
  }
`;

apolloClient
  .subscribe({
    fetchPolicy: "network-only",
    query: SUBSCRIPTION,
    variables: {
      selling: SELLING,
      buying: BUYING
    }
  })
  .subscribe({
		// This function will be called every time we have any updates of given pair
		// of assets, but not more than once per ledger.
		//
		// NOTE: Sometimes, this event might be triggered without actual change of 
		// best price, but just because there were some activity regarding pair in 
		// question.
    next(data: any) {
      const values = data.data.tick;
      console.log(
        `[${new Date().toISOString()}]`,
        "BID/ASK:",
        `${values.bestBid}/${values.bestAsk}`
      );
    }
  });