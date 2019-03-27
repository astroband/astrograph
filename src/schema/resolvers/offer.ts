import { withFilter } from "graphql-subscriptions";
import { assetResolver, createBatchResolver, eventMatches, ledgerResolver } from "./util";

import { db } from "../../database";
import { Account, MutationType, Offer } from "../../model";
import { AssetFactory } from "../../model/factories";
import { OFFER, OFFERS_TICK, pubsub } from "../../pubsub";

const accountResolver = createBatchResolver<Offer, Account>((source: any) =>
  db.accounts.findAllByIDs(source.map((r: Offer) => r.sellerID))
);

const offerMatches = (variables: any, payload: any): boolean => {
  const sellingAssetEq = variables.args.sellingAssetEq;
  const buyingAssetEq = variables.args.buyingAssetEq;

  if (!eventMatches(variables.args, payload.id, payload.mutationType)) {
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

    resolve(payload: any, args: any, ctx: any, info: any) {
      return payload;
    }
  };
};

export default {
  Offer: {
    seller: accountResolver,
    selling: assetResolver,
    buying: assetResolver,
    ledger: ledgerResolver
  },
  OfferValues: {
    seller: accountResolver,
    selling: assetResolver,
    buying: assetResolver
  },
  Query: {
    offers(root: any, args: any, ctx: any, info: any) {
      const { first, offset, orderBy, ...criteria } = args;
      const columnsMap = { id: "offerid" };
      let orderColumn = "offerid";
      let orderDir: "ASC" | "DESC" = "DESC";

      if (orderBy) {
        [orderColumn, orderDir] = orderBy.split("_");
        orderColumn = columnsMap[orderColumn];
      }

      return db.offers.findAll(criteria, first, offset, [orderColumn, orderDir]);
    },
    async tick(root: any, args: any, ctx: any, info: any) {
      const selling = AssetFactory.fromId(args.selling);
      const buying = AssetFactory.fromId(args.buying);
      const bestAsk = await db.offers.getBestAsk(selling, buying);
      const bestAskInv = await db.offers.getBestAsk(buying, selling);

      return {
        selling: args.selling,
        buying: args.buying,
        bestAsk,
        bestBid: 1 / bestAskInv
      };
    }
  },
  Subscription: {
    offer: offerSubscription(OFFER),
    tick: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(OFFERS_TICK),
        (payload, variables) => payload.selling === variables.selling && payload.buying === variables.buying
      ),
      resolve(payload: any, args: any, ctx: any, info: any) {
        return payload;
      }
    }
  }
};
