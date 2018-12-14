import { gql } from "apollo-server";

export const typeDefs = gql`
  enum OperationKind {
    payment
    setOption
    accountMerge
    allowTrust
    bumpSequence
    changeTrust
    createAccount
    manageDatum
    manageOffer
    pathPayment
  }

  interface IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
  }

  type PaymentOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    destination: AccountID!
    asset: Asset!
    amount: String!
    source: AccountID!
  }

  type SetOptionsOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    clearFlags: Int
    setFlags: Int
    homeDomain: String
    masterWeight: Int
    thresholds: SetOptionsThresholds
    signer: SetOptionsSigner
    inflationDestination: AccountID
  }

  type AccountMergeOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    destination: AccountID!
  }

  type AllowTrustOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    trustor: AccountID
    authorize: Boolean
    assetCode: AssetCode
  }

  type BumpSequenceOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    bumpTo: Int!
  }

  type ChangeTrustOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    limit: String!
    asset: Asset!
  }

  type CreateAccountOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    startingBalance: String!
    destination: AccountID!
  }

  type ManageDatumOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    name: String!
    value: String
  }

  type ManageOfferOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    priceComponents: OfferPriceComponents!
    price: String!
    offerId: String!
    amount: String!
    assetSelling: Asset!
    assetBuying: Asset!
  }

  type PathPaymentOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    sendMax: String!
    destinationAmount: String!
    destinationAsset: Asset!
    sourceAsset: Asset!
    destinationAccount: AccountID!
    sourceAccount: AccountID!
    path: [Asset]
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

  input PaymentOpFilter {
    destination: AccountID
    source: AccountID
    asset: AssetInput
  }

  input SetOptionsOpFilter {
    masterWeight: Int
  }

  input AccountMergeOpFilter {
    destination: AccountID
  }

  input AllowTrustOpFilter {
    trustor: AccountID
    assetCode: AssetCode
    authorize: Boolean
  }

  input BumpSequenceOpFilter {
    bumpTo: Int
  }

  input ChangeTrustOpFilter {
    limit: String
    asset: AssetInput
  }

  input CreateAccountOpFilter {
    destination: AccountID
  }

  input ManageDataOpFilter {
    name: String
    value: String
  }

  input ManageOfferOpFilter {
    assetSelling: AssetInput
    assetBuying: AssetInput
    offerId: String
  }

  input PathPaymentOpFilter {
    sourceAccount: AccountID
    destinationAccount: AccountID
    destinationAsset: AssetInput
    sourceAsset: AssetInput
    pathContains: AssetInput
  }

  input OperationsFilter {
    payment: PaymentOpFilter
    setOption: SetOptionsOpFilter
    accountMerge: AccountMergeOpFilter
    allowTrust: AllowTrustOpFilter
    bumpSequence: BumpSequenceOpFilter
    changeTrust: ChangeTrustOpFilter
    createAccount: CreateAccountOpFilter
    manageDatum: ManageDataOpFilter
    manageOffer: ManageOfferOpFilter
    pathPayment: PathPaymentOpFilter
  }

`;
