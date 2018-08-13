import { gql } from "apollo-server";

export const typeDefs = gql`
  type Signer {
    accountID: AccountID!
    signer: AccountID!
    weight: Int!
  }
`;
