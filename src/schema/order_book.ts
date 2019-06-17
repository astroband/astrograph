import { gql } from "apollo-server";

export const typeDefs = gql`
  "Represents a bid or an ask on particular asset pair on the exchange"
  type OrderBookItem {
    price: String!
    amount: String!
  }

  "Represents [orderbook](https://www.stellar.org/developers/horizon/reference/endpoints/orderbook-details.html)"
  type OrderBook {
    bids: [OrderBookItem!]
    asks: [OrderBookItem!]
  }

  extend type Query {
    "Get order book details"
    orderBook(selling: AssetID!, buying: AssetID!, limit: Int): OrderBook
  }
`;
