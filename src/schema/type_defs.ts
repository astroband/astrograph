import { gql } from "apollo-server";

export const typeDefs = gql`
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

  input EventInput {
    mutationTypeIn: [MutationType!]
    idEq: AccountID
    idIn: [AccountID!]
  }

  type Subscription {
    trustLine(args: EventInput): TrustLineSubscriptionPayload
    dataEntry(args: EventInput): DataEntrySubscriptionPayload
  }

`;
