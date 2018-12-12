import { gql } from "apollo-server";

export const typeDefs = gql`
  enum OperationKind {
    payment
    setOption
    accountMerge
    allowTrust
    bumpSequence
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

  input OperationsFilter {
    payment: PaymentOpFilter
    setOption: SetOptionsOpFilter
    accountMerge: AccountMergeOpFilter
    allowTrust: AllowTrustOpFilter
    bumpSequence: BumpSequenceOpFilter
  }

`;
