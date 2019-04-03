import { gql } from "apollo-server";

export const typeDefs = gql`
  type Trade {
    ID: String
    ledgerCloseTime: DateTime!
    offer: Offer
    baseOffer: Offer
    baseAccount: Account
    baseAmount: Float!
    baseAsset: Asset!
    counterOffer: Offer
    counterAccount: Account
    counterAmount: Float!
    counterAsset: Asset!
    baseIsSeller: Boolean
  }

  type TradeConnection {
    pageInfo: PageInfo!
    nodes: [Trade]
    edges: [TradeEdge]
  }

  type TradeEdge {
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
    ): TradeConnection!
  }

`;
