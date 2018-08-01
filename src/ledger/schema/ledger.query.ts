import { gql } from "apollo-server";

const ledgerQuery = gql`
  type Query {
    ledger(seq: Int!): Ledger
  }
`;
export { ledgerQuery };
