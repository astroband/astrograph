import { gql, makeExecutableSchema } from "apollo-server";
import operationResolvers from "./resolvers/horizon_operation";

export const typeDefs = gql`
  scalar AssetCode
  scalar AccountID
  scalar OfferID
  scalar TimeBounds
  scalar MemoValue
  scalar DateTime

  type Asset {
    native: Boolean!
    issuer: AccountID
    code: AssetCode!
  }

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
    dateTime: DateTime!
  }

  type PaymentOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    dateTime: DateTime!
    destination: AccountID!
    asset: Asset!
    amount: String!
    source: AccountID!
  }

  type SetOptionsOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
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
    dateTime: DateTime!
    destination: AccountID!
  }

  type AllowTrustOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    dateTime: DateTime!
    trustor: AccountID
    authorize: Boolean
    assetCode: AssetCode
  }

  type BumpSequenceOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    dateTime: DateTime!
    bumpTo: Int!
  }

  type ChangeTrustOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    dateTime: DateTime!
    limit: String!
    asset: Asset!
  }

  type CreateAccountOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    dateTime: DateTime!
    startingBalance: String!
    destination: AccountID!
  }

  type ManageDatumOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    dateTime: DateTime!
    name: String!
    value: String
  }

  type ManageOfferOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
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

  type Query {
    accountOperations(
      account: AccountID!
      first: Int!
    ): [IOperation]
  }
`;

export const schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: [operationResolvers]
});
