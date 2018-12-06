import { Account, Offer } from "../../model";

import { withFilter } from "graphql-subscriptions";
import { createBatchResolver, eventMatches, ledgerResolver } from "./util";

import { db } from "../../database";

import { DATA_ENTRY, pubsub } from "../../pubsub";

const accountResolver = createBatchResolver<Offer, Account>((source: any) =>
  db.accounts.findAllByIDs(source.map((r: Offer) => r.seller))
);

const dataEntrySubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
        return eventMatches(variables.args, payload.accountID, payload.mutationType);
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
  Subscription: {
    dataEntry: dataEntrySubscription(DATA_ENTRY)
  },
  Query: {
    dataEntries(root: any, args: any, ctx: any, info: any) {
      return db.dataEntries.findAllByAccountID(args.id);
    }
  }
};
