import { gql } from "apollo-server";

const signerType = gql`
  type Signer {
    accountId: AccountID!
    signer: AccountID!
    weight: Int!
  }
`;

export { signerType };
