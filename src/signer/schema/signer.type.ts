import { gql } from "apollo-server";

const signerType = gql`
  type Signer {
    accountID: AccountID!
    signer: AccountID!
    weight: Int!
  }
`;

export { signerType };
