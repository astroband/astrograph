import { IHorizonTradeData } from "../../datasource/types";
import { IApolloContext } from "../../graphql_server";
import { Trade } from "../../model";
import { TradeFactory } from "../../model/factories";
import { makeConnection } from "./util";

import * as resolvers from "./shared";

export default {
  Trade: {
    baseAsset: resolvers.asset,
    counterAsset: resolvers.asset,
    baseAccount: resolvers.account,
    counterAccount: resolvers.account
  },
  Query: {
    trades: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const { baseAsset, counterAsset, offerID } = args;

      const records = await ctx.dataSources.trades.all(args, baseAsset, counterAsset, offerID);
      return makeConnection<IHorizonTradeData, Trade>(records, r => TradeFactory.fromHorizon(r));
    }
  }
};
