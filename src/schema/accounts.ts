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

  interface IAccount {
    id: AccountID!
    sequenceNumber: String!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    signers: [Signer]
  }

  type Account implements IAccount {
    id: AccountID!
    sequenceNumber: String!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    ledger: Ledger!
    signers: [Signer]
    data: [DataEntry]
    trustLines: [TrustLine]
    signerFor(first: Int!): [Account!]
    operations(first: Int, after: String, last: Int, before: String): OperationsConnection
  }

  type OperationsConnection {
    pageInfo: PageInfo!
    edges: [OperationsEdge]
  }

  type OperationsEdge {
    cursor: String!
    node: Operation
  }

  type AccountValues implements IAccount {
    id: AccountID!
    sequenceNumber: String!
    numSubentries: Int!
    inflationDest: AccountID
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    signers: [Signer]
  }

  type AccountSubscriptionPayload {
    id: AccountID!
    mutationType: MutationType!
    values: AccountValues
  }

  type Signer {
    account: Account!
    signer: Account!
    weight: Int!
  }

  extend type Query {
    account(id: AccountID!): Account
    accounts(id: [AccountID!]!): [Account]
    accountsSignedBy(id: AccountID!, first: Int!): [Account!]
    signers(id: AccountID!): [Signer]
  }

  extend type Subscription {
    account(args: EventInput): AccountSubscriptionPayload
  }

`;
