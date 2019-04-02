import { gql } from "apollo-server";

export const typeDefs = gql`
  type PaymentPath {
    source_asset: Asset!
    source_amount: Float!
    destination_asset: Asset!
    destination_amount: Float!
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
