import { Account, IAssetInput, MutationType, Offer } from "../../model";
import Asset from "../../util/asset";

import { withFilter } from "graphql-subscriptions";
import { assetResolver, createBatchResolver, eventMatches, ledgerResolver } from "./util";

import { OFFER, pubsub } from "../../pubsub";
import { IApolloContext } from "../../util/types";

const accountResolver = createBatchResolver<Offer, Account>((source: any, args: any, ctx: IApolloContext) =>
  ctx.db.accounts.findAllByIDs(source.map((r: Offer) => r.sellerid))
);

const assetFromArg = (arg: IAssetInput): Asset | null => {
  if (!arg) {
    return null;
  }

  if (arg.issuer && arg.code) {
    return new Asset(arg.code, arg.issuer);
  }
  return Asset.native();
};

const offerMatches = (variables: any, payload: any): boolean => {
  if (eventMatches(variables.args, payload.id, payload.mutationType)) {
    const selling = assetFromArg(variables.args.sellingAssetEq);
    const buying = assetFromArg(variables.args.buyingAssetEq);

    if ((selling || buying) && payload.mutationType === MutationType.Remove) {
      return false;
    }

    if (selling && payload.selling && !selling.equals(payload.selling)) {
      return false;
    }

    if (buying && payload.buying && !buying.equals(payload.buying)) {
      return false;
    }
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
    seller: accountResolver,
    selling: assetResolver,
    buying: assetResolver,
    ledger: ledgerResolver
  },
  Query: {
    offers(root: any, args: any, ctx: IApolloContext, info: any) {
      return ctx.db.offers.findAll(args.seller, args.selling, args.buying, args.first, args.limit);
    }
  },
  Subscription: {
    offer: offerSubscription(OFFER)
  }
};
