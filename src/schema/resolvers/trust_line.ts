import { withFilter } from "graphql-subscriptions";

import { Account, TrustLine } from "../../model";
import { pubsub, TRUST_LINE } from "../../pubsub";
import { IApolloContext } from "../../util/types";
import { assetResolver, createBatchResolver, eventMatches, ledgerResolver } from "./util";

const accountResolver = createBatchResolver<TrustLine, Account | null>(
  (source: ReadonlyArray<TrustLine>, args: any, ctx: IApolloContext) =>
    ctx.db.accounts.findAllByIDs(source.map(r => r.accountID))
);

const trustLineSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
        return eventMatches(variables.args, payload.accountID, payload.mutationType);
      }
    ),

    resolve(payload: any, args: any, ctx: IApolloContext, info: any) {
      return payload;
    }
  };
};

export default {
  TrustLine: {
    account: accountResolver,
    ledger: ledgerResolver,
    asset: assetResolver
  },
  Subscription: {
    trustLine: trustLineSubscription(TRUST_LINE)
  },
  Query: {
    async trustLines(root: any, args: any, ctx: IApolloContext, info: any) {
      const account = await ctx.db.accounts.findByID(args.id);

      if (account !== null) {
        const trustLines = await ctx.db.trustLines.findAllByAccountID(args.id);

        trustLines.unshift(TrustLine.buildFakeNative(account));

        return trustLines;
      }

      return [];
    }
  }
};
