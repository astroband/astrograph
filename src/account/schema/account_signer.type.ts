import { gql } from "apollo-server";

const accountSignerType = gql`
  type AccountSigner {
    id: ID!
    accountId: AccountID!
    signer: AccountID!
    weight: Int!
  }
`;

export { accountSignerType };
