import { gql } from "apollo-server";

export const typeDefs = gql`
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
    memo: Memo
    feeAmount: String!
    sourceAccount: String!
    timeBounds: TimeBounds
    feeCharged: String!
    success: Boolean!
    resultCode: Int!
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

  type ChangeTrustOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    limit: String!
    asset: Asset!
  }

  type CreateAccountOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    startingBalance: String!
    destination: AccountID!
  }

  type ManageDatumOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    name: String!
    value: String
  }

  type ManageOfferOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    priceComponents: OfferPriceComponents!
    price: String!
    offerId: String!
    amount: String!
    assetSelling: Asset!
    assetBuying: Asset!
  }

  type PathPaymentOperation implements IOperation {
    kind: OperationKind!
    account: AccountID!
    transaction: Transaction!
    index: Int!
    dateTime: DateTime!
    sendMax: String!
    destinationAmount: String!
    destinationAsset: Asset!
    sourceAsset: Asset!
    destinationAccount: AccountID!
    sourceAccount: AccountID!
    path: [Asset]
  }

  type OfferPriceComponents {
    n: Int!
    d: Int!
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

  input ChangeTrustOpFilter {
    limit: String
    asset: AssetInput
  }

  input CreateAccountOpFilter {
    destination: AccountID
  }

  input ManageDataOpFilter {
    name: String
    value: String
  }

  input ManageOfferOpFilter {
    assetSelling: AssetInput
    assetBuying: AssetInput
    offerId: String
  }

  input PathPaymentOpFilter {
    sourceAccount: AccountID
    destinationAccount: AccountID
    destinationAsset: AssetInput
    sourceAsset: AssetInput
    pathContains: AssetInput
  }

  input OperationsFilter {
    payment: PaymentOpFilter
    setOption: SetOptionsOpFilter
    accountMerge: AccountMergeOpFilter
    allowTrust: AllowTrustOpFilter
    bumpSequence: BumpSequenceOpFilter
    changeTrust: ChangeTrustOpFilter
    createAccount: CreateAccountOpFilter
    manageDatum: ManageDataOpFilter
    manageOffer: ManageOfferOpFilter
    pathPayment: PathPaymentOpFilter
  }

  input AssetInput {
    code: AssetCode!
    issuer: AccountID!
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
    buyingAssetEq: AssetInput
    sellingAssetEq: AssetInput
  }

  type Query {
    account(id: AccountID!): Account
    accounts(id: [AccountID!]!): [Account]
    accountsSignedBy(id: AccountID!, first: Int!): [Account!]
    accountTransactions(id: AccountID!, first: Int!, offset: Int): [Transaction]
    accountOperations(
      account: AccountID!
      kinds: [OperationKind]
      filters: OperationsFilter
      first: Int!
      offset: Int
    ): [IOperation]
    assetOperations(asset: AssetInput!, kinds: [OperationKind], first: Int!, offset: Int): [IOperation]
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

  type Subscription {
    ledgerCreated: Ledger

    account(args: EventInput): AccountSubscriptionPayload
    trustLine(args: EventInput): TrustLineSubscriptionPayload
    dataEntry(args: EventInput): DataEntrySubscriptionPayload
    offer(args: OfferEventInput): OfferSubscriptionPayload
  }

`;
