import { gql } from "apollo-server";

export const typeDefs = gql`
  type PaymentPath {
    sourceAsset: Asset!
    sourceAmount: Float!
    destinationAsset: Asset!
    destinationAmount: Float!
    path: [Asset!]
  }

  extend type Query {
    findPaymentPaths(
      sourceAccountID: AccountID!
      destinationAccountID: AccountID!
      destinationAsset: AssetInput!
      destinationAmount: Float!
    ): [PaymentPath!]
  }

`;
