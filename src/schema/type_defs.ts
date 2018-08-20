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

  interface IAccount {
    id: AccountID!
    balance: Float!
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
    balance: Float!
    sequenceNumber: Float!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    lastModified: Int!
    signers: [Signer]
    data: [DataEntry]
    trustLines: [TrustLine]
  }

  type AccountEntry implements IAccount {
    id: AccountID!
    balance: Float!
    sequenceNumber: Float!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    signers: [Signer]
  }

  type AccountKey {
    id: AccountID!
  }

  type TrustLineFlags {
    authorized: Boolean!
  }

  interface ITrustLine {
    asset: Asset!
    limit: Float!
    balance: Float!
    flags: TrustLineFlags
    lastModified: Int!
  }

  type TrustLine implements ITrustLine {
    account: Account!
    asset: Asset!
    limit: Float!
    balance: Float!
    flags: TrustLineFlags
    lastModified: Int!
  }

  type TrustLineEntry implements ITrustLine {
    accountID: AccountID!
    asset: Asset!
    limit: Float!
    balance: Float!
    flags: TrustLineFlags
    lastModified: Int!
  }

  type TrustLineKey {
    accountID: AccountID!
    asset: Asset!
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

    accountCreated(id: AccountID): AccountEntry
    accountUpdated(id: AccountID): AccountEntry
    accountRemoved(id: AccountID): AccountKey

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
