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
    inflationDestination: Account
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    signers: [Signer]
  }

  type Account implements IAccount {
    id: AccountID!
    sequenceNumber: String!
    numSubentries: Int!
    inflationDestination: Account
    homeDomain: String
    thresholds: AccountThresholds!
    flags: AccountFlags!
    ledger: Ledger!
    signers: [Signer]
    data: [DataEntry]
    trustLines: [TrustLine]
    operations(first: Int, after: String, last: Int, before: String): OperationConnection
    effects(first: Int, after: String, last: Int, before: String): EffectConnection
  }

  type OperationConnection {
    pageInfo: PageInfo!
    nodes: [Operation]
    edges: [OperationEdge]
  }

  type OperationEdge {
    cursor: String!
    node: Operation
  }

  type AccountValues implements IAccount {
    id: AccountID!
    sequenceNumber: String!
    numSubentries: Int!
    inflationDestination: Account
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
  }

  extend type Subscription {
    account(args: EventInput): AccountSubscriptionPayload
  }

`;
