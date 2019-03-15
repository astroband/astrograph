import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar TransactionHash

  type Transaction {
    id: TransactionHash!
    ledger: Ledger!
    index: Int!
    memo: Memo
    feeAmount: String!
    sourceAccount: AccountID!
    timeBounds: TimeBounds
    feeCharged: String!
    success: Boolean!
    resultCode: Int!
  }

  type TransactionsConnection {
    pageInfo: PageInfo!
    edges: [TransactionsEdge]
  }

  type TransactionsEdge {
    cursor: String!
    node: Transaction
  }

  extend type Query {
    transaction(id: TransactionHash!): Transaction
    transactions(first: Int, after: String, last: Int, before: String): TransactionsConnection
  }

`;
