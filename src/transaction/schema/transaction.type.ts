import { gql } from "apollo-server";

const transactionType = gql`
  type Transaction {
    ID: String!
    ledgerSeq: Int!
    index: Int!
    body: String!
    result: String!
    meta: String!
  }
`;

export { transactionType };
