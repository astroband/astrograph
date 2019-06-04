import { gql } from "apollo-server";

export const typeDefs = gql`
  "Represents transaction's hash"
  scalar TransactionHash
  "Arbitrary memo content"
  scalar MemoValue

  "Represents time range"
  type TimeBounds {
    minTime: DateTime!
    maxTime: DateTime
  }

  enum MemoType {
    id
    text
    hash
    return
    none
  }

  "Extra information, attached to the transaction. It is the responsibility of the client to interpret it"
  type Memo {
    value: MemoValue
    type: MemoType!
  }

  "Represents a single [transaction](https://www.stellar.org/developers/guides/concepts/transactions.html) on Stellar network"
  type Transaction {
    id: TransactionHash!
    "Ledger in which transaction was executed"
    ledger: Ledger!
    "Index of this transaction in the ledger"
    index: Int!
    memo: Memo
    "The fee that source account had to pay"
    feeAmount: Int!
    "Account that issued the transaction"
    sourceAccount: Account!
    "Time range, in which transaction is considered valid. [More info](https://www.stellar.org/developers/guides/concepts/transactions.html#time-bounds)"
    timeBounds: TimeBounds
    "The actual fee paid by the source account"
    feeCharged: Int!
    success: Boolean!
    resultCode: Int!
    "Operations, which this transaction contains"
    operations(first: Int, after: String, last: Int, before: String, order: Order): OperationConnection
    "Payment-relate operations, which this transaction contains"
    payments(first: Int, after: String, last: Int, before: String): OperationConnection
  }

  type TransactionConnection {
    pageInfo: PageInfo!
    nodes: [Transaction]
    edges: [TransactionEdge]
  }

  type TransactionEdge {
    cursor: String!
    node: Transaction
  }

  extend type Query {
    "Get single transaction by id"
    transaction(id: TransactionHash!): Transaction
    "Get list of transactions"
    transactions(first: Int, after: String, last: Int, before: String): TransactionConnection
  }
`;
