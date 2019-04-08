import { IHorizonPaymentPathData } from "../../datasource/types";
import { AssetFactory } from "../../model/factories";
import * as resolvers from "./shared";

export default {
  PaymentPath: {
    sourceAsset: resolvers.asset,
    destinationAsset: resolvers.asset,
    path: resolvers.asset
  },
  Query: {
    async findPaymentPaths(root: any, args: any, ctx: any, info: any) {
      const { sourceAccountID, destinationAccountID, destinationAsset, destinationAmount } = args;

      const records = await ctx.dataSources.horizon.getPaymentPath(
        sourceAccountID,
        destinationAccountID,
        destinationAmount,
        destinationAsset
      );

      const r = records.map((record: IHorizonPaymentPathData) => {
        const path = record.path.map((asset: any) =>
          AssetFactory.fromHorizonResponse(asset.asset_type, asset.asset_code, asset.asset_issuer)
        );

        return {
          sourceAsset: AssetFactory.fromHorizonResponse(
            record.source_asset_type,
            record.source_asset_code,
            record.source_asset_issuer
          ),
          destinationAsset: AssetFactory.fromHorizonResponse(
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
