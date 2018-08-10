import { gql } from "apollo-server";

// NOTE: GraphQL treats INT as 32-bit numbers. sequenceNumber is 52-bit BigInt hence have to use Float.
const accountType = gql`
  type Account {
    id: AccountID!
    balance: Float!
    sequenceNumber: Float!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    lastModified: Int!
    data: [AccountDataEntry]
    signers: [AccountSigner]
  }
`;

export { accountType };

// trustlines: [Trustline!]!
// data: [DataEntry!]
// signers: [Signer!]
