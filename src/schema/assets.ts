import { gql } from "apollo-server";

export const typeDefs = gql`
  "Stellar asset alphanumeric code"
  scalar AssetCode
  "String in \`{id}-{issuer}'\` format, which uniquely identifies single asset"
  scalar AssetID

  "Represents single [asset](https://www.stellar.org/developers/guides/concepts/assets.html) on Stellar network"
  type Asset {
    "Whether this asset is [lumens](https://www.stellar.org/developers/guides/concepts/assets.html)"
    native: Boolean!
    "Asset issuer's account"
    issuer: Account
    "Asset's code"
    code: AssetCode!
  }

  "Represents single [asset](https://www.stellar.org/developers/guides/concepts/assets.html) on Stellar network with additional statistics, provided by Horizon"
  type AssetWithInfo {
    "Whether this asset is [lumens](https://www.stellar.org/developers/guides/concepts/assets.html)"
    native: Boolean!
    "Asset issuer's account"
    issuer: Account
    "Asset's code"
    code: AssetCode!
    "The number of units of credit issued"
    amount: Float
    "The number of accounts that: 1) trust this asset and 2) where if the asset has the auth_required flag then the account is authorized to hold the asset"
    numAccounts: Int
    "Asset's issuer account flags"
    flags: AccountFlags
  }

  "A list of assets"
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
    "Get list of assets"
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
