import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar OfferID

  interface IOffer {
    id: OfferID!
    "Account created this offer"
    seller: Account!
    "Asset seller is selling"
    selling: Asset!
    "Asset seller wants to buy"
    buying: Asset!
    "Amount of \`selling\` being sold"
    amount: Float!
    "Price of 1 unit of \`selling\` in terms of \`buying\`"
    price: String!
    "Is this offer [passive](https://www.stellar.org/developers/guides/concepts/list-of-operations.html#create-passive-offer)"
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
    "The ledger this offer was created in"
    ledger: Ledger!
  }

  "Represents a current offer state, which is broadcasted to subscribers"
  type OfferValues implements IOffer {
    id: OfferID!
    seller: Account!
    selling: Asset!
    buying: Asset!
    amount: Float!
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

  "Offers list sorting options"
  enum OfferOrderByInput {
    "Sort by id in descending order"
    id_DESC
    "Sort by id in ascending order"
    id_ASC
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
      orderBy: OfferOrderByInput
      first: Int!
      offset: Int
    ): [Offer]
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
