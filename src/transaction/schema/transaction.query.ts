import { gql } from "apollo-server";

const transactionQuery = gql`
  type Query {
    transaction(id: String!): Transaction
    transactionsByLedgerSeq(ledgerSeq: Int!): [Transaction!]
  }
`;
export { transactionQuery };
