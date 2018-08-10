import { gql } from "apollo-server";

const dataEntryType = gql`
  type DataEntry {
    accountId: AccountID!
    name: String!
    value: String!
    lastModified: Int!
  }
`;

export { dataEntryType };
