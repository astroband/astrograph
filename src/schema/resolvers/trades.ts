import { IApolloContext } from "../../graphql_server";
import { ITrade } from "../../model";
import { TradeFactory } from "../../model/factories";
import { ITradeData as IStorageTradeData } from "../../storage/types";
import { makeConnection } from "./util";

import * as resolvers from "./shared";

export default {
  Trade: {
    assetSold: resolvers.asset,
    assetBought: resolvers.asset,
    seller: resolvers.account,
    buyer: resolvers.account
  },
  Query: {
    trades: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const { assetSold, assetBought, offer, ...paging } = args;
      const storage = ctx.storage.trades;

      if (offer) {
        storage.forOffer(offer);
      }

      const records = await storage.filter({ assetSold, assetBought }).all(paging);

      return makeConnection<IStorageTradeData, ITrade>(records, r => TradeFactory.fromStorage(r));
    }
  }
};
