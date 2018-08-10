import { gql } from "apollo-server";

const dataEntryQuery = gql`
  type Query {
    dataEntries(id: AccountID!): [DataEntry]
  }
`;
export { dataEntryQuery };
