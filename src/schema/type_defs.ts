import { gql } from "apollo-server";

export default gql`
  scalar AssetCode
  scalar AccountID

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

  type DataEntry {
    account: Account!
    name: String!
    value: String!
    ledger: Ledger!
  }

  type Signer {
    account: Account!
    signer: Account!
    weight: Int!
  }

  interface IAccount {
    id: AccountID!
    sequenceNumber: Float!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    signers: [Signer]
  }

  type Account implements IAccount {
    id: AccountID!
    sequenceNumber: Float!
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

  type AccountEventPayload implements IAccount {
    id: AccountID!
    sequenceNumber: Float!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    signers: [Signer]
  }

  type AccountRemoveEventPayload {
    id: AccountID!
  }

  interface ITrustLine {
    asset: Asset!
    limit: Float!
    balance: Float!
    authorized: Boolean!
  }

  type TrustLine implements ITrustLine {
    account: Account!
    asset: Asset!
    limit: Float!
    balance: Float!
    authorized: Boolean!
    ledger: Ledger!
  }

  type TrustLineEventPayload implements ITrustLine {
    accountID: AccountID!
    asset: Asset!
    limit: Float!
    balance: Float!
    authorized: Boolean!
  }

  type TrustLineRemoveEventPayload {
    accountID: AccountID!
    asset: Asset!
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
    account(id: AccountID!): Account!
    accounts(id: [AccountID!]): [Account]
    dataEntries(id: AccountID!): [DataEntry]
    signers(id: AccountID!): [Signer]
    trustLines(id: AccountID!): [TrustLine]
    ledger(seq: Int!): Ledger
    ledgers(seq: [Int!]): [Ledger]
    transaction(id: String!): Transaction
    transactions(id: [String!]): [Transaction]
  }

  type Subscription {
    ledgerCreated: Ledger

    accountCreated(id: AccountID): AccountEventPayload
    accountUpdated(id: AccountID): AccountEventPayload
    accountRemoved(id: AccountID): AccountRemoveEventPayload

    trustLineCreated(id: AccountID): TrustLineEventPayload
    trustLineUpdated(id: AccountID): TrustLineEventPayload
    trustLineRemoved(id: AccountID): TrustLineRemoveEventPayload
  }

`;
// dataEntryCreated(id: AccountID): DataEntry
// dataEntryUpdated(id: AccountID): DataEntry
// dataEntryDeleted(id: AccountID): DataEntry
//
// transactionCreated(id: AccountID): Transaction
