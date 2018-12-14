import { gql } from "apollo-server";

export default gql`
  scalar AssetCode
  scalar AccountID
  scalar OfferID
  scalar TimeBounds
  scalar MemoValue
  scalar DateTime

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
  }

  type Asset {
    native: Boolean!
    issuer: AccountID
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
    signerFor(first: Int!): [Account!]
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

  interface IOffer {
    id: OfferID!
    seller: Account!
    selling: Asset!
    buying: Asset!
    amount: Int!
    price: String!
    passive: Boolean!
  }

  type Offer implements IOffer {
    id: OfferID!
    seller: Account!
    selling: Asset!
    buying: Asset!
    amount: Int!
    price: String!
    passive: Boolean!
    ledger: Ledger!
  }

  type OfferValues implements IOffer {
    id: OfferID!
    seller: Account!
    selling: Asset!
    buying: Asset!
    amount: Int!
    price: String!
    passive: Boolean!
  }

  type OfferSubscriptionPayload {
    accountID: AccountID!
    mutationType: MutationType!
    offerID: OfferID!
    values: OfferValues
  }

  type Transaction {
    id: String!
    ledger: Ledger!
    index: Int!
    body: String!
    memo: Memo
    feeAmount: Int!
    result: String!
    meta: String!
    feeMeta: String!
    sourceAccount: String!
    timeBounds: TimeBounds
  }

  type PaymentOperation {
    destination: AccountID!
    asset: Asset!
    amount: String!
    source: AccountID!
    dateTime: DateTime!
  }

  type Query {
    account(id: AccountID!): Account
    accounts(id: [AccountID!]): [Account]
    accountsSignedBy(id: AccountID!, first: Int!): [Account!]
    accountTransactions(id: AccountID!, first: Int!, offset: Int): [Transaction]
    accountPayments(
      id: AccountID!
      destination: AccountID
      asset: AssetInput
      first: Int!
      offset: Int
    ): [PaymentOperation]
    assets(code: AssetCode, issuer: AccountID, first: Int, offset: Int): [Asset]
    dataEntries(id: AccountID!): [DataEntry]
    signers(id: AccountID!): [Signer]
    trustLines(id: AccountID!): [TrustLine]
    ledger(seq: Int!): Ledger!
    ledgers(seq: [Int!]): [Ledger]!
    transaction(id: String!): Transaction
    transactions(id: [String!]): [Transaction]
    offers(seller: AccountID, selling: AssetInput, buying: AssetInput, first: Int!, offset: Int): [Offer]
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

  input OfferEventInput {
    mutationTypeIn: [MutationType!]
    idEq: AccountID
    idIn: [AccountID!]
    buyingAssetEq: Asset
    sellingAssetEq: Asset
  }

  type Subscription {
    ledgerCreated: Ledger

    account(args: EventInput): AccountSubscriptionPayload
    trustLine(args: EventInput): TrustLineSubscriptionPayload
    dataEntry(args: EventInput): DataEntrySubscriptionPayload
    offer(args: OfferEventInput): OfferSubscriptionPayload
  }

`;
//
// transactionCreated(id: AccountID): Transaction
