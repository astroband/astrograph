import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar TransactionHash

  type Transaction {
    id: TransactionHash!
    ledger: Ledger!
    index: Int!
    memo: Memo
    feeAmount: Int!
    sourceAccount: Account!
    timeBounds: TimeBounds
    feeCharged: Int!
    success: Boolean!
    resultCode: Int!
    operations(first: Int, after: String, last: Int, before: String): OperationConnection
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
    transaction(id: TransactionHash!): Transaction
    transactions(first: Int, after: String, last: Int, before: String): TransactionConnection
  }

`;
