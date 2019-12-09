import { gql } from "apollo-server";

export const typeDefs = gql`
  "Represents single trade(fulfilled offer)"
  type Trade {
    id: String
    "When the ledger with this trade was closed"
    ledgerCloseTime: DateTime!
    "The sell offer"
    offer: OfferID
    seller: Account
    "Amount of \`assetSold\` that was moved from \`seller\` to \`buyer\`"
    amountSold: String!
    assetSold: Asset!
    "Counter party of this trade"
    buyer: Account
    "Amount of \`assetBought\` that was moved from \`buyer\` to \`seller\`"
    amountBought: String!
    assetBought: Asset!
    "Original offer price"
    price: String
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
    "Get list of trades"
    trades(
      assetSold: AssetID
      assetBought: AssetID
      offer: String
      first: Int
      after: String
      last: Int
      before: String
    ): TradeConnection!
  }
`;
