import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar AssetCode
  scalar AssetID

  type Asset {
    native: Boolean!
    issuer: Account
    code: AssetCode!
  }

  type AssetWithInfo {
    native: Boolean!
    issuer: Account
    code: AssetCode!
    amount: Float
    numAccounts: Int
    flags: AccountFlags
  }

  type AssetWithInfoConnection {
    pageInfo: PageInfo!
    nodes: [AssetWithInfo]
    edges: [AssetWithInfoEdge]
  }

  type AssetWithInfoEdge {
    cursor: String!
    node: AssetWithInfo
  }

  input AssetInput {
    code: AssetCode
    issuer: AccountID
  }

  type Query {
    assets(
      code: AssetCode
      issuer: AccountID
      first: Int
      after: String
      last: Int
      before: String
    ): AssetWithInfoConnection
  }

`;
