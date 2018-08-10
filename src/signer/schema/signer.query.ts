import { gql } from "apollo-server";

const signerQuery = gql`
  type Query {
    signers(id: AccountID!): [Signer]
  }
`;
export { signerQuery };
