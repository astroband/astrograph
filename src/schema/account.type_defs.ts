import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar AccountID

  type AccountFlags {
    authRequired: Boolean!
    authRevokable: Boolean!
    authImmutable: Boolean!
  }

  type AccountThresholds {
    masterWeight: Int!
    low: Int!
    medium: Int!
    high: Int!
  }

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
