import { IHorizonPaymentPathData } from "../../datasource/types";
import { IApolloContext } from "../../graphql_server";
import { AssetFactory } from "../../model/factories";
import * as resolvers from "./shared";

export default {
  PaymentPath: {
    sourceAsset: resolvers.asset,
    destinationAsset: resolvers.asset,
    path: resolvers.asset
  },
  Query: {
    findPaymentPaths: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const { sourceAccountID, destinationAccountID, destinationAsset, destinationAmount } = args;

      const records = await ctx.dataSources.pathfinding.findPaths(
        sourceAccountID,
        destinationAccountID,
        destinationAmount,
        destinationAsset
      );

      const r = records.map((record: IHorizonPaymentPathData) => {
        const path = record.path.map((asset: any) =>
          AssetFactory.fromHorizon(asset.asset_type, asset.asset_code, asset.asset_issuer)
        );

        return {
          sourceAsset: AssetFactory.fromHorizon(
            record.source_asset_type,
            record.source_asset_code,
            record.source_asset_issuer
          ),
          destinationAsset: AssetFactory.fromHorizon(
            record.destination_asset_type,
            record.destination_asset_code,
            record.destination_asset_issuer
          ),
          sourceAmount: record.source_amount,
          destinationAmount: record.destination_amount,
          path
        };
      });

      return r;
    }
  }
};
