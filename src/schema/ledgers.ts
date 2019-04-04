import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar LedgerSeq

  type LedgerHeader {
    ledgerVersion: LedgerSeq!
    previousLedgerHash: String!
    txSetResultHash: String!
    baseFee: Int!
    baseReserve: Int!
    maxTxSetSize: Int!
  }

  type Ledger {
    seq: LedgerSeq!
    header: LedgerHeader
    transactions(first: Int, last: Int, before: String, after: String): TransactionConnection
    operations(first: Int, last: Int, before: String, after: String, order: Order): OperationConnection
  }

  extend type Query {
    ledger(seq: LedgerSeq!): Ledger!
    ledgers(seq: [LedgerSeq!]): [Ledger]!
  }

  extend type Subscription {
    ledgerCreated: Ledger
  }

`;
