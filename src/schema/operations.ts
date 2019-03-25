import { gql } from "apollo-server";

export const typeDefs = gql`
  interface Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: AccountID!
    dateTime: DateTime!
    transaction: Transaction!
  }

  type PaymentOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: AccountID!
    dateTime: DateTime!
    transaction: Transaction!
    destination: AccountID!
    asset: Asset!
    amount: String!
    source: AccountID!
  }

  type SetOptionsOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: AccountID!
    dateTime: DateTime!
    transaction: Transaction!
    clearFlags: Int
    setFlags: Int
    homeDomain: String
    masterWeight: Int
    thresholds: SetOptionsThresholds
    signer: SetOptionsSigner
    inflationDestination: AccountID
  }

  type AccountMergeOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: AccountID!
    dateTime: DateTime!
    transaction: Transaction!
    destination: AccountID!
  }

  type AllowTrustOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: AccountID!
    dateTime: DateTime!
    transaction: Transaction!
    trustor: AccountID!
    authorize: Boolean!
    asset: Asset!
  }

  type BumpSequenceOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: AccountID!
    dateTime: DateTime!
    transaction: Transaction!
    bumpTo: Int!
  }

  type ChangeTrustOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: AccountID!
    dateTime: DateTime!
    transaction: Transaction!
    limit: String!
    asset: Asset!
  }

  type CreateAccountOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: AccountID!
    dateTime: DateTime!
    transaction: Transaction!
    startingBalance: String!
    destination: AccountID!
  }

  type ManageDatumOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: AccountID!
    dateTime: DateTime!
    transaction: Transaction!
    name: String!
    value: String
  }

  type ManageOfferOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: AccountID!
    dateTime: DateTime!
    transaction: Transaction!
    priceComponents: OfferPriceComponents!
    price: String!
    offerId: String!
    amount: String!
    assetSelling: Asset!
    assetBuying: Asset!
  }

  type PathPaymentOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: AccountID!
    dateTime: DateTime!
    transaction: Transaction!
    sendMax: String!
    amountSent: String!
    amountReceived: String!
    destinationAsset: Asset!
    sourceAsset: Asset!
    destinationAccount: AccountID!
  }

  type OfferPriceComponents {
    n: Int!
    d: Int!
  }

  type SetOptionsThresholds {
    low: Int
    medium: Int
    high: Int
  }

  type SetOptionsSigner {
    account: AccountID
    weight: Int
  }

  enum SortOrder {
    desc
    asc
  }

  extend type Subscription {
    operations(
      txSource: [AccountID]
      opSource: [AccountID]
      kind: [OperationKind]
      destination: [AccountID]
      asset: [AssetID]
    ): Operation!
  }

`;
