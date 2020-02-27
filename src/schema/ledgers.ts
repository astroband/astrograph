import { gql } from "apollo-server";

export const typeDefs = gql`
  "Ledger sequence number"
  scalar LedgerSeq

  "Represents a [ledger header](https://www.stellar.org/developers/guides/concepts/ledger.html#ledger-header)"
  type LedgerHeader {
    "Protocol version of this ledger"
    ledgerVersion: LedgerSeq!
    previousLedgerHash: String!
    "Hash of the results of applying the transaction set"
    txSetResultHash: String!
    "The fee the network charges per operation in a transaction"
    baseFee: Int!
    "The reserve the network uses when calculating an account’s minimum balance"
    baseReserve: Int!
    "The maximum number of transactions the validators have agreed to process in this ledger"
    maxTxSetSize: Int!
  }

  "Represents a [ledger](https://www.stellar.org/developers/guides/concepts/ledger.html)"
  type Ledger {
    "Sequence number"
    seq: LedgerSeq!
    header: LedgerHeader
    "Transactions that were applied in this ledger"
    transactions(first: Int, last: Int, before: String, after: String): TransactionConnection
    "Operations that were performed in this ledger"
    operations(first: Int, last: Int, before: String, after: String, order: Order): OperationConnection
    "Payment-like operations that were performed in this ledger"
    payments(first: Int, last: Int, before: String, after: String): OperationConnection
  }

  extend type Query {
    "Get single ledger by its sequence number"
    ledger(seq: LedgerSeq!): Ledger!
    "Get list of ledgers by sequence numbers"
    ledgers(seq: [LedgerSeq!]!): [Ledger]!
  }

  extend type Subscription {
    "Subscribe to the new ledger creation event"
    ledgerCreated: Ledger
  }
`;
