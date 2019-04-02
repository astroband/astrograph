import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar OfferID

  interface IOffer {
    id: OfferID!
    seller: Account!
    selling: Asset!
    buying: Asset!
    amount: Float!
    price: String!
    passive: Boolean!
  }

  type Offer implements IOffer {
    id: OfferID!
    seller: Account!
    selling: Asset!
    buying: Asset!
    amount: Float!
    price: String!
    passive: Boolean!
    ledger: Ledger!
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

  type OfferValues implements IOffer {
    id: OfferID!
    seller: Account!
    selling: Asset!
    buying: Asset!
    amount: Float!
    price: String!
    passive: Boolean!
  }

  type OfferSubscriptionPayload {
    accountID: AccountID!
    mutationType: MutationType!
    offerID: OfferID!
    values: OfferValues
  }

  input OfferEventInput {
    mutationTypeIn: [MutationType!]
    idEq: AccountID
    idIn: [AccountID!]
    buyingAssetEq: AssetInput
    sellingAssetEq: AssetInput
  }

  type Tick {
    selling: AssetID
    buying: AssetID
    bestBid: Float
    bestAsk: Float
  }

  extend type Query {
    offers(
      seller: AccountID
      selling: AssetID
      buying: AssetID
      first: Int
      after: String
      last: Int
      before: String
    ): OfferConnection
    tick(selling: AssetID!, buying: AssetID!): Tick
  }

  extend type Subscription {
    offer(args: OfferEventInput): OfferSubscriptionPayload
    tick(selling: AssetID, buying: AssetID): Tick
  }

`;
