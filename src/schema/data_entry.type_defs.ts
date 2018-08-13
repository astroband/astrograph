import { gql } from "apollo-server";

export const typeDefs = gql`
  type DataEntry {
    accountID: AccountID!
    name: String!
    value: String!
    lastModified: Int!
  }
`;
