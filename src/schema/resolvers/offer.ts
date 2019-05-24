import { withFilter } from "graphql-subscriptions";
import { getCustomRepository, getRepository } from "typeorm";

import * as resolvers from "./shared";
import { eventMatches, makeConnection } from "./util";

import { MutationType, OfferValues, Trade } from "../../model";
import { AssetFactory, TradeFactory } from "../../model/factories";
import { Offer } from "../../orm/entities";
import { OfferRepository } from "../../orm/repository/offer";
import { OFFER, OFFERS_TICK, pubsub } from "../../pubsub";

import { IHorizonTradeData } from "../../datasource/types";
import { IApolloContext } from "../../graphql_server";
import { AssetTransformer } from "../../util/orm";
import { paginate } from "../../util/paging";
import { toFloatAmountString } from "../../util/stellar";

const offerMatches = (variables: any, payload: any): boolean => {
  const args = variables.args;
  const sellingAssetEq = args ? args.sellingAssetEq : undefined;
  const buyingAssetEq = args ? args.buyingAssetEq : undefined;

  if (!eventMatches(args, payload.id, payload.mutationType)) {
    return false;
  }

  const selling = sellingAssetEq ? AssetFactory.fromInput(sellingAssetEq) : undefined;
  const buying = buyingAssetEq ? AssetFactory.fromInput(buyingAssetEq) : undefined;

  if ((selling || buying) && payload.mutationType === MutationType.Remove) {
    return false;
  }

  if (selling && payload.selling && !selling.equals(payload.selling)) {
    return false;
  }

  if (buying && payload.buying && !buying.equals(payload.buying)) {
    return false;
  }

  return true;
};

const offerSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => offerMatches(variables, payload)
    ),

    resolve(payload: any, args: any, ctx: IApolloContext, info: any) {
      return payload;
    }
  };
};

export default {
  Offer: {
    amount: (root: Offer) => toFloatAmountString(root.amount),
    seller: resolvers.account,
    selling: resolvers.asset,
    buying: resolvers.asset,
    ledger: resolvers.ledger,
    trades: async (root: Offer, args: any, ctx: IApolloContext, info: any) => {
      const records = await ctx.dataSources.trades.forOffer(root.id, args);
      return makeConnection<IHorizonTradeData, Trade>(records, r => TradeFactory.fromHorizon(r));
    }
  },
  OfferValues: {
    seller: resolvers.account,
    selling: resolvers.asset,
    buying: resolvers.asset,
    amount: (root: OfferValues) => toFloatAmountString(root.amount),

  },
  Query: {
    offers: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const { selling, buying, ...paging } = args;

      const qb = getRepository(Offer).createQueryBuilder("offers");

      qb.where("offers.selling = :selling")
        .andWhere("offers.buying = :buying")
        .setParameter("selling", AssetTransformer.to(selling))
        .setParameter("buying", AssetTransformer.to(buying));

      const offers = await paginate(qb, paging, ["offers.price", "offers.id"], Offer.parsePagingToken);

      return makeConnection<Offer>(offers);
    },
    tick: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const repo = getCustomRepository(OfferRepository);
      const { selling, buying } = args;

      const bestAsk = await repo.findBestAsk(selling, buying);
      const bestAskInv = await repo.findBestAsk(buying, selling);
      const bestBid = bestAskInv ? 1 / bestAskInv : null;

      return { selling, buying, bestAsk, bestBid };
    }
  },
  Subscription: {
    offer: offerSubscription(OFFER),
    tick: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(OFFERS_TICK),
        (payload, variables) => payload.selling === variables.selling && payload.buying === variables.buying
      ),
      resolve(payload: any, args: any, ctx: IApolloContext, info: any) {
        return payload;
      }
    }
  }
};
