import { fieldsList } from "graphql-fields-list";
import { db } from "../../database";
import { IHorizonTradeData } from "../../datasource/types";
import { Offer, Trade } from "../../model";
import { TradeFactory } from "../../model/factories/trade_factory";
import { createBatchResolver } from "./util";

import * as resolvers from "./shared";

const offerResolver = createBatchResolver<any, Offer[]>((source: any, args: any, context: any, info: any) => {
  const requestedFields = fieldsList(info);
  const ids: string[] = source.map((s: any) => s[info.fieldName]);

  // if user requested only "id", we can return it right away
  if (requestedFields.length === 1 && requestedFields[0] === "id") {
    return ids.map(id => (id ? { id } : null));
  }

  return db.offers.findAllByIDs(ids);
});

const makeConnection = (last: string, records: IHorizonTradeData[]) => {
  // we must keep descending ordering, because Horizon doesn't do it,
  // when you request the previous page
  if (last) {
    records = records.reverse();
  }

  const edges = records.map((record: IHorizonTradeData) => {
    return {
      node: TradeFactory.fromHorizonResponse(record),
      cursor: record.paging_token
    };
  });

  return {
    nodes: edges.map((edge: { cursor: string; node: Trade }) => edge.node),
    edges,
    pageInfo: {
      startCursor: records.length !== 0 ? records[0].paging_token : null,
      endCursor: records.length !== 0 ? records[records.length - 1].paging_token : null
    }
  };
};

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
  Account: {
    async trades(root: any, args: any, ctx: any, info: any) {
      const { first, last, after, before } = args;

      const records = await ctx.dataSources.horizon.getAccountTrades(
        root.id,
        first || last,
        last ? "asc" : "desc",
        last ? before : after
      );

      return makeConnection(last, records);
    }
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
