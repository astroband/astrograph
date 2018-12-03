import { Account, TrustLine } from "../../model";
import { assetResolver, createBatchResolver, eventMatches, ledgerResolver } from "./util";

import { withFilter } from "graphql-subscriptions";

import { db } from "../../database";
import { pubsub, TRUST_LINE } from "../../pubsub";

const accountResolver = createBatchResolver<TrustLine, Account | null>((source: ReadonlyArray<TrustLine>) =>
  db.accounts.findAllByIDs(source.map(r => r.accountID))
);

const trustLineSubscription = (event: string) => {
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
  TrustLine: {
    account: accountResolver,
    ledger: ledgerResolver,
    asset: assetResolver
  },
  Subscription: {
    trustLine: trustLineSubscription(TRUST_LINE)
  },
  Query: {
    async trustLines(root: any, args: any, ctx: any, info: any) {
      const account = await db.accounts.findByID(args.id);

      if (account !== null) {
        const trustLines = await db.trustLines.findAllByAccountID(args.id);

        trustLines.unshift(TrustLine.buildFakeNative(account));

        return trustLines;
      }

      return [];
    }
  }
};
