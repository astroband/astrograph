import { gql } from "apollo-server";

export const typeDefs = gql`
  type Transaction {
    ID: String!
    ledgerSeq: Int!
    index: Int!
    body: String!
    result: String!
    meta: String!
  }

  type Query {
    transaction(id: String!): Transaction
    transactionsByLedgerSeq(ledgerSeq: Int!): [Transaction!]
  }
`;
