import { Account, Asset, MutationType, Offer } from "../../model";

import { withFilter } from "graphql-subscriptions";
import { assetResolver, createBatchResolver, eventMatches, ledgerResolver } from "./util";

import { db } from "../../database";

import { OFFER, pubsub } from "../../pubsub";

const accountResolver = createBatchResolver<Offer, Account>((source: any) =>
  db.accounts.findAllByIDs(source.map((r: Offer) => r.sellerID))
);

const offerMatches = (variables: any, payload: any): boolean => {
  if (eventMatches(variables.args, payload.id, payload.mutationType)) {
    const selling = Asset.fromInput(variables.args.sellingAssetEq);
    const buying = Asset.fromInput(variables.args.buyingAssetEq);

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
    }
  },
  Subscription: {
    offer: offerSubscription(OFFER)
  }
};
