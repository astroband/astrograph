import { gql } from "apollo-server";

const accountQuery = gql`
  type Query {
    account(id: AccountID!): Account!
  }
`;
export { accountQuery };
