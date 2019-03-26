import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar AssetCode
  scalar AssetID
  scalar TimeBounds
  scalar MemoValue
  scalar DateTime

  enum Order {
    desc
    asc
  }

  type PageInfo {
    startCursor: String
    endCursor: String
  }

  enum MemoType {
    id
    text
    hash
    return
    none
  }

  enum MutationType {
    CREATE
    UPDATE
    REMOVE
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
    createPassiveOffer
    pathPayment
  }

  type Memo {
    value: MemoValue
    type: MemoType!
  }

  type Asset {
    native: Boolean!
    issuer: Account
    code: AssetCode!
  }

  interface IDataEntry {
    name: String!
    value: String!
    ledger: Ledger!
  }

  type DataEntry implements IDataEntry {
    account: Account!
    name: String!
    value: String!
    ledger: Ledger!
  }

  type DataEntryValues implements IDataEntry {
    account: Account!
    name: String!
    value: String!
    ledger: Ledger!
  }

  type DataEntrySubscriptionPayload {
    account: Account!
    name: String!
    mutationType: MutationType!
    values: DataEntryValues
  }

  interface ITrustLine {
    asset: Asset!
    limit: String!
    balance: String!
    authorized: Boolean!
  }

  type TrustLine implements ITrustLine {
    account: Account
    asset: Asset!
    limit: String!
    balance: String!
    authorized: Boolean!
    ledger: Ledger!
  }

  type TrustLineValues implements ITrustLine {
    account: Account
    asset: Asset!
    limit: String!
    balance: String!
    authorized: Boolean!
  }

  type TrustLineSubscriptionPayload {
    account: Account!
    asset: Asset!
    mutationType: MutationType!
    values: TrustLineValues
  }

  input AssetInput {
    code: AssetCode
    issuer: AccountID
  }

  input EventInput {
    mutationTypeIn: [MutationType!]
    idEq: AccountID
    idIn: [AccountID!]
  }

  type Query {
    assets(code: AssetCode, issuer: AccountID, first: Int, offset: Int): [Asset]
  }

  type Subscription {
    trustLine(args: EventInput): TrustLineSubscriptionPayload
    dataEntry(args: EventInput): DataEntrySubscriptionPayload
  }

`;
