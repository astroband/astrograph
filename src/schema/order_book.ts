import { gql } from "apollo-server";

export const typeDefs = gql`
  "Represents a bid or an ask on particular asset pair on the exchange"
  type OrderBookItem {
    price: Float!
    amount: Float!
  }

  "Represents [orderbook](https://www.stellar.org/developers/horizon/reference/endpoints/orderbook-details.html)"
  type OrderBook {
    bids: [OrderBookItem!]
    asks: [OrderBookItem!]
  }

  extend type Query {
    "Get order book details"
    orderBook(selling: AssetInput!, buying: AssetInput!, limit: Int): OrderBook
  }

`;
