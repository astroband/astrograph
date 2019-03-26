import { gql } from "apollo-server";

export const typeDefs = gql`
  interface Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: Account!
    dateTime: DateTime!
    transaction: Transaction!
  }

  type PaymentOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: Account!
    dateTime: DateTime!
    transaction: Transaction!
    destination: Account!
    asset: Asset!
    amount: String!
  }

  type SetOptionsOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: Account!
    dateTime: DateTime!
    transaction: Transaction!
    clearFlags: Int
    setFlags: Int
    homeDomain: String
    masterWeight: Int
    thresholds: SetOptionsThresholds
    signer: SetOptionsSigner
    inflationDestination: Account
  }

  type AccountMergeOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: Account!
    dateTime: DateTime!
    transaction: Transaction!
    destination: Account!
  }

  type AllowTrustOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: Account!
    dateTime: DateTime!
    transaction: Transaction!
    trustor: Account!
    authorize: Boolean!
    asset: Asset!
  }

  type BumpSequenceOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: Account!
    dateTime: DateTime!
    transaction: Transaction!
    bumpTo: Int!
  }

  type ChangeTrustOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: Account!
    dateTime: DateTime!
    transaction: Transaction!
    limit: String!
    asset: Asset!
  }

  type CreateAccountOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: Account!
    dateTime: DateTime!
    transaction: Transaction!
    startingBalance: String!
    destination: Account!
  }

  type ManageDatumOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: Account!
    dateTime: DateTime!
    transaction: Transaction!
    name: String!
    value: String
  }

  type ManageOfferOperation implements Operation {
    id: String!
    kind: OperationKind!
    sourceAccount: Account!
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
    sourceAccount: Account!
    dateTime: DateTime!
    transaction: Transaction!
    sendMax: String!
    amountSent: String!
    amountReceived: String!
    destinationAsset: Asset!
    sourceAsset: Asset!
    destinationAccount: Account!
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
    account: Account
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
