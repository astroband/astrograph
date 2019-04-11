import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar OfferID

  type Offer {
    id: OfferID!
    seller: Account!
    selling: Asset!
    buying: Asset!
    amount: String!
    price: String!
    passive: Boolean!
    "The ledger this offer was created in"
    ledger: Ledger!
    trades(first: Int, after: String, last: Int, before: String): TradeConnection!
  }

  "Represents a current offer state, which is broadcasted to subscribers"
  type OfferValues {
    id: OfferID!
    seller: Account!
    selling: Asset!
    buying: Asset!
    amount: String!
    price: String!
    passive: Boolean!
  }

  "Represents an offer update payload, which is broadcasted to subscribers"
  type OfferSubscriptionPayload {
    accountID: AccountID!
    mutationType: MutationType!
    offerID: OfferID!
    values: OfferValues
  }

  "Input type, which represents offer events subscription filtering options"
  input OfferEventInput {
    mutationTypeIn: [MutationType!]
    idEq: AccountID
    idIn: [AccountID!]
    buyingAssetEq: AssetInput
    sellingAssetEq: AssetInput
  }

  type OfferConnection {
    pageInfo: PageInfo!
    nodes: [Offer]
    edges: [OfferEdge]
  }

  type OfferEdge {
    cursor: String!
    node: Offer
  }

  "Represents best bid/ask pair for the pair of assets"
  type Tick {
    selling: AssetID
    buying: AssetID
    bestBid: Float
    bestAsk: Float
  }

  extend type Query {
    "Get list of offers"
    offers(
      seller: AccountID
      selling: AssetCode
      buying: AssetCode
      first: Int
      after: String
      last: Int
      before: String
      order: Order
    ): OfferConnection
    "Get current best bid/ask offer for the given pair of assets"
    tick(selling: AssetID!, buying: AssetID!): Tick
  }

  extend type Subscription {
    "Subscribe on offers updates"
    offer(args: OfferEventInput): OfferSubscriptionPayload
    "Subscribe on best bid/ask updates"
    tick(selling: AssetID, buying: AssetID): Tick
  }
`;
