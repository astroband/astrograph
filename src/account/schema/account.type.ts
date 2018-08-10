import { gql } from "apollo-server";

const accountType = gql`
  type Account {
    id: AccountID!
    balance: Float!
    sequenceNumber: Int!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    lastModified: Int!
  }
`;

export { accountType };

// trustlines: [Trustline!]!
// data: [DataEntry!]
// signers: [Signer!]
