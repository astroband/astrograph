import { gql } from "apollo-server";

export const typeDefs = gql`
  "Represents single [trade](https://www.stellar.org/developers/horizon/reference/resources/trade.html)(fulfilled offer)"
  type Trade {
    id: String
    "When the ledger with this trade was closed"
    ledgerCloseTime: DateTime!
    "The sell offer"
    offer: Offer
    baseOffer: Offer
    "Base party of this trade"
    baseAccount: Account
    "Amount of \`baseAsset\` that was moved from \`baseAccount\` to \`counterAccount\`"
    baseAmount: Float!
    baseAsset: Asset!
    counterOffer: Offer
    "Counter party of this trade"
    counterAccount: Account
    "Amount of \`counterAsset\` that was moved from \`counterAccount\` to \`baseAccount\`"
    counterAmount: Float!
    counterAsset: Asset!
    "Indicates which party of the trade made the sell offer"
    baseIsSeller: Boolean
    "Original offer price"
    price: Float
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
      baseAsset: AssetInput
      counterAsset: AssetInput
      offerID: Int
      first: Int
      after: String
      last: Int
      before: String
    ): TradeConnection!
  }
`;
