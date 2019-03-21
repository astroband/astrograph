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
    pathPayment
  }

  type Memo {
    value: MemoValue
    type: MemoType!
  }

  type LedgerHeader {
    ledgerVersion: Int!
    previousLedgerHash: String!
    txSetResultHash: String!
    baseFee: Int!
    baseReserve: Int!
    maxTxSetSize: Int!
  }

  type Ledger {
    seq: Int!
    header: LedgerHeader
    transactions(first: Int, last: Int, before: String, after: String): TransactionConnection
  }

  type Asset {
    native: Boolean!
    issuer: AccountID
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
    accountID: AccountID!
    name: String!
    value: String!
    ledger: Ledger!
  }

  type DataEntrySubscriptionPayload {
    accountID: AccountID!
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
    account: Account!
    asset: Asset!
    limit: String!
    balance: String!
    authorized: Boolean!
    ledger: Ledger!
  }

  type TrustLineValues implements ITrustLine {
    accountID: AccountID!
    asset: Asset!
    limit: String!
    balance: String!
    authorized: Boolean!
  }

  type TrustLineSubscriptionPayload {
    accountID: AccountID!
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
    trustLines(id: AccountID!): [TrustLine]
    ledger(seq: Int!): Ledger!
    ledgers(seq: [Int!]): [Ledger]!
  }

  type Subscription {
    ledgerCreated: Ledger

    trustLine(args: EventInput): TrustLineSubscriptionPayload
    dataEntry(args: EventInput): DataEntrySubscriptionPayload
  }

`;
