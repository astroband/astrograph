import { BigNumber } from "bignumber.js";
import { getRepository } from "typeorm";
import { IApolloContext } from "../../graphql_server";
import { TrustLine } from "../../orm/entities";
import { findPaymentPaths } from "../../service/dex";
import { STELLAR_AMOUNT_PRECISION } from "../../util/stellar";
import * as resolvers from "./shared";

export default {
  PaymentPath: {
    sourceAmount: (root: any) => {
      return root.sourceAmount.toFixed(STELLAR_AMOUNT_PRECISION);
    },
    sourceAsset: resolvers.asset,
    destinationAsset: resolvers.asset,
    path: resolvers.asset
  },
  Query: {
    findPaymentPaths: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const { sourceAccountID, destinationAsset, destinationAmount } = args;

      const accountTrustlines = await getRepository(TrustLine).find({ where: { account: sourceAccountID } });

      const nodes = findPaymentPaths(
        accountTrustlines.map(t => t.asset).concat("native"),
        destinationAsset,
        new BigNumber(destinationAmount)
      );

      return Object.entries(nodes).map(([sourceAsset, data]) => {
        return {
          sourceAsset,
          sourceAmount: data.amountNeeded,
          destinationAsset,
          destinationAmount,
          path: data.path
        };
      });
    }
  }
};
