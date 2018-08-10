import { gql } from "apollo-server";

const dataEntryType = gql`
  type DataEntry {
    accountID: AccountID!
    name: String!
    value: String!
    lastModified: Int!
  }
`;

export { dataEntryType };
