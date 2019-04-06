import { gql } from "apollo-server";

export const typeDefs = gql`
  enum EffectKind {
    accountCreated
    accountRemoved
    accountCredited
    accountDebited
    accountThresholdsUpdated
    accountHomeDomainUpdated
    accountFlagsUpdated
    accountInflationDestinationUpdated
    signerCreated
    signerRemoved
    signerUpdated
    trustlineCreated
    trustlineRemoved
    trustlineUpdated
    trustlineAuthorized
    trustlineDeauthorized
    offerCreated
    offerRemoved
    offerUpdated
    trade
    dataCreated
    dataRemoved
    dataUpdated
    sequenceBumped
  }

  "Common [effect](https://www.stellar.org/developers/horizon/reference/resources/effect.html) attributes"
  interface Effect {
    id: String!
    "Account that this effect changed"
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
  }

  type AccountCreatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    "The XLM balance new account was created with"
    startingBalance: String!
  }

  type AccountRemovedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
  }

  type AccountCreditedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    amount: String!
  }

  type AccountDebitedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    amount: String!
  }

  type AccountThresholdsUpdatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    lowThreshold: Int!
    medThreshold: Int!
    highThreshold: Int!
  }

  type AccountHomeDomainUpdatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    homeDomain: String!
  }

  type AccountFlagsUpdatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    authRequiredFlag: Boolean
    authRevokableFlag: Boolean
  }

  type AccountInflationDestinationUpdatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
  }

  type SequenceBumpedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    newSeq: Int!
  }

  type SignerCreatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    weight: Int!
    publicKey: AccountID!
    key: AccountID!
  }

  type SignerRemovedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    weight: Int!
    publicKey: AccountID!
    key: AccountID!
  }

  type SignerUpdatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    weight: Int!
    publicKey: AccountID!
    key: AccountID!
  }

  type TrustlineCreatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    asset: Asset!
    limit: String!
  }

  type TrustlineRemovedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    asset: Asset!
    limit: String!
  }

  type TrustlineUpdatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    asset: Asset!
    limit: String!
  }

  type TrustlineAuthorizedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    trustor: AccountID!
    asset: Asset!
  }

  type TrustlineDeauthorizedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    trustor: AccountID!
    asset: Asset!
  }

  type OfferCreatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
  }

  type OfferRemovedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
  }

  type OfferUpdatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
  }

  type TradeEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
    seller: AccountID!
    offerId: OfferID!
    soldAmount: String!
    soldAsset: Asset!
    boughtAmount: String!
    boughtAsset: Asset!
  }

  type DataCreatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
  }

  type DataUpdatedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
  }

  type DataRemovedEffect implements Effect {
    id: String!
    account: Account!
    kind: EffectKind!
    createdAt: DateTime!
  }

  type EffectConnection {
    pageInfo: PageInfo!
    nodes: [Effect]
    edges: [EffectEdge]
  }

  type EffectEdge {
    cursor: String!
    node: Effect
  }

  extend type Query {
    "Get list of the effects"
    effects(first: Int, last: Int, after: String, before: String): EffectConnection
  }
`;
