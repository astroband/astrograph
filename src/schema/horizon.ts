import { gql } from "apollo-server";

export const typeDefs = gql`
  interface Operation {
    id: String!
    kind: OperationKind!
    opSource: AccountID!
    dateTime: DateTime!
  }

  type PaymentOperation implements Operation {
    id: String!
    kind: OperationKind!
    opSource: AccountID!
    dateTime: DateTime!
    destination: AccountID!
    asset: Asset!
    amount: String!
    source: AccountID!
  }

  type SetOptionsOperation implements Operation {
    id: String!
    kind: OperationKind!
    opSource: AccountID!
    dateTime: DateTime!
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
    opSource: AccountID!
    dateTime: DateTime!
    destination: AccountID!
  }

  type AllowTrustOperation implements Operation {
    id: String!
    kind: OperationKind!
    opSource: AccountID!
    dateTime: DateTime!
    trustor: AccountID!
    authorize: Boolean!
    asset: Asset!
  }

  type BumpSequenceOperation implements Operation {
    id: String!
    kind: OperationKind!
    opSource: AccountID!
    dateTime: DateTime!
    bumpTo: Int!
  }

  type ChangeTrustOperation implements Operation {
    id: String!
    kind: OperationKind!
    opSource: AccountID!
    dateTime: DateTime!
    limit: String!
    asset: Asset!
  }

  type CreateAccountOperation implements Operation {
    id: String!
    kind: OperationKind!
    opSource: AccountID!
    dateTime: DateTime!
    startingBalance: String!
    destination: AccountID!
  }

  type ManageDatumOperation implements Operation {
    id: String!
    kind: OperationKind!
    opSource: AccountID!
    dateTime: DateTime!
    name: String!
    value: String
  }

  type ManageOfferOperation implements Operation {
    id: String!
    kind: OperationKind!
    opSource: AccountID!
    dateTime: DateTime!
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
    opSource: AccountID!
    dateTime: DateTime!
    sendMax: String!
    amountSent: String!
    amountReceived: String!
    destinationAsset: Asset!
    sourceAsset: Asset!
    destinationAccount: AccountID!
    sourceAccount: AccountID!
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

  extend type Query {
    accountOperations(account: AccountID!, first: Int!, order: SortOrder, cursor: String): [IOperation]
  }

  extend type Subscription {
    operations(
      txSource: [AccountID]
      opSource: [AccountID]
      kind: [OperationKind]
      destination: [AccountID]
    ): IOperation
  }

`;
