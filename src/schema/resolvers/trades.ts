import { db } from "../../database";
import { Offer } from "../../model";
import { createBatchResolver, makeConnection, idOnlyRequested } from "./util";

import * as resolvers from "./shared";

const offerResolver = createBatchResolver<any, Offer[]>((source: any, args: any, context: any, info: any) => {
  const ids: string[] = source.map((s: any) => s[info.fieldName]);

  // if user requested only "id", we can return it right away
  if (idOnlyRequested(info)) {
    return ids.map(id => (id ? { id } : null));
  }

  return db.offers.findAllByIDs(ids);
});

//      node: TradeFactory.fromHorizonResponse(record),

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
    async trades(root: any, args: any, ctx: any, info: any) {
      const { first, last, after, before } = args;
      const { baseAsset, counterAsset, offerID } = args;

      const records = await ctx.dataSources.horizon.getTrades(
        baseAsset,
        counterAsset,
        offerID,
        first || last,
        last ? "asc" : "desc",
        last ? before : after
      );

      return makeConnection(last, records);
    }
  }
};
