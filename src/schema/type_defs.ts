import { gql } from "apollo-server";

export default gql`
  scalar AssetCode
  scalar AccountID

  enum AssetType {
    Native
    AlphaNum4
    AlphaNum12
  }

  type Asset {
    type: AssetType!
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
    accountID: AccountID!
    name: String!
    value: String!
    lastModified: Int!
  }

  type Signer {
    accountID: AccountID!
    signer: AccountID!
    weight: Int!
  }

  type Account {
    id: AccountID!
    balance: Float!
    sequenceNumber: Float!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    lastModified: Int!
    data: [DataEntry]
    signers: [Signer]
    trustLines: [TrustLine]
  }

  type TrustLineFlags {
    authorized: Boolean!
  }

  type TrustLine {
    account: Account!
    asset: Asset!
    limit: Float!
    balance: Float!
    flags: TrustLineFlags
    lastModified: Int!
  }

  type Transaction {
    ID: String!
    ledgerSeq: Int!
    index: Int!
    body: String!
    result: String!
    meta: String!
  }

  type Ledger {
    ledgerSeq: Int!
    ledgerVersion: Int!
    previousLedgerHash: String!
    txSetResultHash: String!
    baseFee: Int!
    baseReserve: Int!
    maxTxSetSize: Int!
  }

  type Query {
    account(id: AccountID!): Account!
    dataEntries(id: AccountID!): [DataEntry]
    signers(id: AccountID!): [Signer]
    ledger(seq: Int!): Ledger
    transaction(id: String!): Transaction
  }

  type Subscription {
    ledgerCreated: Ledger

    accountCreated(id: AccountID): Account
    accountUpdated(id: AccountID): Account
    accountRemoved(id: AccountID): Account

    trustLineCreated(id: AccountID): [TrustLine]
    trustLineUpdated(id: AccountID): [TrustLine]
    trustLineRemoved(id: AccountID): [TrustLine]
  }

`;
// dataEntryCreated(id: AccountID): DataEntry
// dataEntryUpdated(id: AccountID): DataEntry
// dataEntryDeleted(id: AccountID): DataEntry
//
// transactionCreated(id: AccountID): Transaction
