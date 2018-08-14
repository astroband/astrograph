import { gql } from "apollo-server";

export default gql`
  scalar AssetCode
  scalar AccountID

  enum AssetType {
    NATIVE
    ALPHANUM_4
    ALPHANUM_12
  }

  type Asset {
    type: AssetType!
    issuer: AccountID
    code: AssetCode
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
    trustLines: [Trustline]
  }

  type TrustlineFlags {
    authorized: Boolean!
  }

  type Trustline {
    accountId: AccountID!
    asset: Asset!
    limit: Float!
    balance: Float!
    flags: TrustlineFlags
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
    transactionsByLedgerSeq(ledgerSeq: Int!): [Transaction!]
  }

  type Subscription {
    ledgerCreated: Ledger
  }

`;
