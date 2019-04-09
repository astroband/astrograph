import { db } from "../../database";
import { IHorizonTradeData } from "../../datasource/types";
import { Offer, Trade } from "../../model";
import { TradeFactory } from "../../model/factories";
import { createBatchResolver, idOnlyRequested, makeConnection } from "./util";

import * as resolvers from "./shared";

const offerResolver = createBatchResolver<any, Offer[]>((source: any, args: any, context: any, info: any) => {
  const ids: string[] = source.map((s: any) => s[info.fieldName]);

  if (idOnlyRequested(info)) {
    return ids.map(id => (id ? { id } : null));
  }

  return db.offers.findAllByIDs(ids);
});

export default {
  Trade: {
    baseAsset: resolvers.asset,
    counterAsset: resolvers.asset,
    baseAccount: resolvers.account,
    counterAccount: resolvers.account,
    offer: offerResolver,
    baseOffer: offerResolver,
    counterOffer: offerResolver
  },
  Offer: {
    async trades(root: any, args: any, ctx: any, info: any) {
      const { first, last, after, before } = args;

      const records = await ctx.dataSources.horizon.getOfferTrades(
        root.id,
        first || last,
        last ? "asc" : "desc",
        last ? before : after
      );

      return makeConnection(last, records);
    }
  },
  Query: {
    trades: async (root: any, args: any, ctx: any, info: any) => {
      const { baseAsset, counterAsset, offerID } = args;

      const records = await ctx.dataSources.horizon.getTrades(args, baseAsset, counterAsset, offerID);
      return makeConnection<IHorizonTradeData, Trade>(records, r => TradeFactory.fromHorizon(r));
    }
  }
};
