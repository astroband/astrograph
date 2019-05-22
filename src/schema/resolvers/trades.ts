import { getRepository } from "typeorm";
import { IHorizonTradeData } from "../../datasource/types";
import { IApolloContext } from "../../graphql_server";
import { Trade } from "../../model";
import { TradeFactory } from "../../model/factories";
import { Offer } from "../../orm/entities";
import { createBatchResolver, idOnlyRequested, makeConnection } from "./util";

import * as resolvers from "./shared";

const offerResolver = createBatchResolver<any, Offer[]>(async (source: any, args: any, context: any, info: any) => {
  const ids: string[] = source.map((s: any) => s[info.fieldName]);

  if (idOnlyRequested(info)) {
    return ids.map(id => (id ? { id } : null));
  }

  const offers = await getRepository(Offer).findByIds(ids);

  return ids.map(id => offers.find(o => o.id === id) || null);
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
  Query: {
    trades: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const { baseAsset, counterAsset, offerID } = args;

      const records = await ctx.dataSources.trades.all(args, baseAsset, counterAsset, offerID);
      return makeConnection<IHorizonTradeData, Trade>(records, r => TradeFactory.fromHorizon(r));
    }
  }
};
