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

  enum OfferOrderByInput {
    id_DESC
    id_ASC
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
      selling: AssetCode
      buying: AssetCode
      orderBy: OfferOrderByInput
      first: Int!
      offset: Int
    ): [Offer]
  }

  extend type Subscription {
    offer(args: OfferEventInput): OfferSubscriptionPayload
    tick(selling: AssetID, buying: AssetID): Tick
  }

`;
