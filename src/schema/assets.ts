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
    "Asset issuer's account. It's \`null\` for native lumens"
    issuer: Account
    "Asset's code"
    code: AssetCode!
    "Sum of all asset holders balances"
    totalSupply: String!
    "Sum of only authorized holders balances"
    circulatingSupply: String!
    "Total number of asset holders"
    holdersCount: Int!
    "Total number of unathorized holders"
    unauthorizedHoldersCount: Int!
    "Ledger this asset was last time modified in"
    lastModifiedIn: Ledger!
    "All accounts that trust this asset, ordered by balance"
    balances(first: Int, last: Int, after: String, before: String): BalanceConnection
  }

  "A list of assets"
  type AssetConnection {
    pageInfo: PageInfo!
    nodes: [Asset]
    edges: [AssetEdge]
  }

  type AssetEdge {
    cursor: String!
    node: Asset
  }

  input AssetInput {
    code: AssetCode
    issuer: AccountID
  }

  type Query {
    "Get single asset"
    asset(id: AssetID): Asset
    "Get list of assets"
    assets(
      code: AssetCode
      issuer: AccountID
      first: Int
      after: String
      last: Int
      before: String
    ): AssetConnection
  }
`;
