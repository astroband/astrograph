import { gql } from "apollo-server";

export const typeDefs = gql`
  "Represents the a series of assets to route a payment through, from \`sourceAsset\` (the asset debited from the payer) to \`destinationAsset\` (the asset credited to the payee)"
  type PaymentPath {
    "The source asset specified in the search that found this path"
    sourceAsset: Asset!
    "An estimated cost for making a payment of \`destinationAmount\` on this path. Suitable for use in a path payments \`sendMax\` field"
    sourceAmount: String!
    "The destination asset specified in the search that found this path"
    destinationAsset: Asset!
    "The destination amount specified in the search that found this path"
    destinationAmount: String!
    "An array of assets that represents the intermediary assets this path hops through"
    path: [Asset!]
  }

  extend type Query {
    "Look up for appropriate payment paths"
    findPaymentPaths(
      "The sender’s account id. Any returned path must use a source that the sender can hold"
      sourceAccountID: AccountID!
      destinationAsset: AssetCode!
      destinationAmount: String!
    ): [PaymentPath!]
  }
`;
