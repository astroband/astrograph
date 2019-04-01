import { gql } from "apollo-server";

export const typeDefs = gql`
  type OrderBookItem {
    price: Float!
    amount: Float!
  }

  type OrderBook {
    bids: [OrderBookItem!]
    asks: [OrderBookItem!]
  }

  extend type Query {
    orderBook(selling: AssetInput!, buying: AssetInput!): OrderBook
  }

`;
