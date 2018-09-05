import { gql } from "apollo-server";

export default gql`
  scalar AssetCode
  scalar AccountID

  enum MutationType {
    CREATE
    UPDATE
    REMOVE
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
  }

  type Asset {
    native: Boolean!
    issuer: AccountID!
    code: AssetCode!
  }

  type AccountFlags {
    authRequired: Boolean!
    authRevokable: Boolean!
    authImmutable: Boolean!
  }

  type AccountThresholds {
    masterWeight: Int!
    low: Int!
    medium: Int!
    high: Int!
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

  type Signer {
    account: Account!
    signer: Account!
    weight: Int!
  }

  interface IAccount {
    id: AccountID!
    sequenceNumber: String!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    signers: [Signer]
  }

  type Account implements IAccount {
    id: AccountID!
    sequenceNumber: String!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    ledger: Ledger!
    signers: [Signer]
    data: [DataEntry]
    trustLines: [TrustLine]
  }

  type AccountValues implements IAccount {
    id: AccountID!
    sequenceNumber: String!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    signers: [Signer]
  }

  type AccountSubscriptionPayload {
    id: AccountID!
    mutationType: MutationType!
    values: AccountValues
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

  type Transaction {
    id: String!
    ledger: Ledger!
    index: Int!
    body: String!
    result: String!
    meta: String!
  }

  type Query {
    account(id: AccountID!): Account
    accounts(id: [AccountID!]): [Account]
    dataEntries(id: AccountID!): [DataEntry]
    signers(id: AccountID!): [Signer]
    trustLines(id: AccountID!): [TrustLine]
    ledger(seq: Int!): Ledger!
    ledgers(seq: [Int!]): [Ledger]!
    transaction(id: String!): Transaction
    transactions(id: [String!]): [Transaction]
  }

  input EventInput {
    idEq: AccountID
    idIn: [AccountID!]
  }

  type Subscription {
    ledgerCreated: Ledger

    accountCreated(args: EventInput): AccountSubscriptionPayload
    accountUpdated(args: EventInput): AccountSubscriptionPayload
    accountRemoved(args: EventInput): AccountSubscriptionPayload

    trustLineCreated(args: EventInput): TrustLineSubscriptionPayload
    trustLineUpdated(args: EventInput): TrustLineSubscriptionPayload
    trustLineRemoved(args: EventInput): TrustLineSubscriptionPayload

    dataEntryCreated(args: EventInput): DataEntrySubscriptionPayload
    dataEntryUpdated(args: EventInput): DataEntrySubscriptionPayload
    dataEntryRemoved(args: EventInput): DataEntrySubscriptionPayload
  }

`;
//
// transactionCreated(id: AccountID): Transaction
