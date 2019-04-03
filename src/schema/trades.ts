import { gql } from "apollo-server";

export const typeDefs = gql`
  type Trade {
    ID: String
    ledgerCloseTime: Date!
    offerID: Int!
    baseOfferID: Int!
    baseAccountID: AccountID!
    baseAmount: Float!
    baseAsset: Asset!
    counterOfferID: AccountID!
    counterAccountID: AccountID!
    counterAmount: Float!
    counterAsset: Asset!
    baseIsSeller: Boolean
  }

  type TradeConnection {
    pageInfo: PageInfo!
    nodes: [Trade]
    edges: [TradeEdge]
  }

  type TransactionEdge {
    cursor: String!
    node: Trade
  }

  extend type Query {
    trades(
      baseAsset: AssetInput!
      counterAsset: AssetInput!
      offerID: Int
      first: Int
      after: String
      last: Int
      before: String
      orderBy: Order
    ): [TradeConnection!]
  }

`;
