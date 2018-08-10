import { gql } from "apollo-server";

const accountDataEntryType = gql`
  type AccountDataEntry {
    accountId: AccountID!
    name: String!
    value: String!
    lastModified: Int!
  }
`;

export { accountDataEntryType };
