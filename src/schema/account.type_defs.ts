export const typeDefs = `
  scalar AccountID
  
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
    data: [DataEntry]
    signers: [Signer]
  }

  type Query {
    account(id: AccountID!): Account!
  }
`;
