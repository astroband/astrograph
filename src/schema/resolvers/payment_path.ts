import { Asset } from "stellar-sdk";
import { IHorizonPaymentPathData } from "../../datasource/types";
import { AssetFactory } from "../../model/factories";

const resolveAsset = (a: Asset): any => {
  return {
    native: a.isNative(),
    code: a.getCode(),
    issuer: a.getIssuer()
  };
};

export default {
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
        const srcAsset = AssetFactory.fromHorizonResponse(
          record.source_asset_type,
          record.source_asset_code,
          record.source_asset_issuer
        );

        const dstAsset = AssetFactory.fromHorizonResponse(
          record.destination_asset_type,
          record.destination_asset_code,
          record.destination_asset_issuer
        );

        const path = record.path.map((asset: any) =>
          resolveAsset(AssetFactory.fromHorizonResponse(asset.asset_type, asset.asset_code, asset.asset_issuer))
        );

        return {
          sourceAsset: resolveAsset(srcAsset),
          destinationAsset: resolveAsset(dstAsset),
          sourceAmount: record.source_amount,
          destinationAmount: record.destination_amount,
          path
        };
      });

      return r;
    }
  }
};
