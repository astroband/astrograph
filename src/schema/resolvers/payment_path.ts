import { BigNumber } from "bignumber.js";
import { getRepository } from "typeorm";
import { IApolloContext } from "../../graphql_server";
// import { AssetFactory } from "../../model/factories";
import { AssetID } from "../../model";
import { TrustLine } from "../../orm/entities/trustline";
import { findPaths } from "../../util/graph/graph";
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

      const trustlines = await getRepository(TrustLine).find({ where: { account: sourceAccountID } });

      const nodes = findPaths(trustlines.map(t => t.asset), destinationAsset, new BigNumber(destinationAmount));

      return Object.entries(nodes)
        .map(([sourceAsset, data]: [AssetID, any]) => {
          return data.map((o: [BigNumber, AssetID[]]) => {
            return {
              sourceAsset,
              sourceAmount: o[0],
              destinationAsset,
              destinationAmount,
              path: o[1]
            };
          });
        })
        .reduce((acc, e) => acc.concat(e), []);
    }
  }
};
