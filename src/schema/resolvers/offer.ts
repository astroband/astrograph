import { Account, Offer } from "../../model";

import { withFilter } from "graphql-subscriptions";
import { assetResolver, createBatchResolver, eventMatches } from "./util";

import { db } from "../../database";

import { OFFER, pubsub } from "../../pubsub";

const accountResolver = createBatchResolver<Offer, Account>((source: any) =>
  db.accounts.findAllByIDs(source.map((r: Offer) => r.sellerid))
);

const offerSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
        return eventMatches(variables.args, payload.id, payload.mutationType);
      }
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
    buying: assetResolver
  },
  Query: {
    offers(root: any, args: any, ctx: any, info: any) {
      return db.offers.findAll(args.seller, args.selling, args.buying, args.first, args.limit);
    }
  },
  Subscription: {
    offer: offerSubscription(OFFER)
  }
};
