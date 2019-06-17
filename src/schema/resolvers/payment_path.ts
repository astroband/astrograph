import { BigNumber } from "bignumber.js";
import { getRepository } from "typeorm";
import { IApolloContext } from "../../graphql_server";
import { findPaths } from "../../offers_graph/singleton";
import { TrustLine } from "../../orm/entities";
import * as resolvers from "./shared";

export default {
  PaymentPath: {
    sourceAsset: resolvers.asset,
    destinationAsset: resolvers.asset,
    path: resolvers.asset
  },
  Query: {
    findPaymentPaths: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const { sourceAccountID, destinationAsset, destinationAmount } = args;

      const accountTrustlines = await getRepository(TrustLine).find({ where: { account: sourceAccountID } });

      const nodes = findPaths(
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
