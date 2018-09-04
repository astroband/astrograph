import { Account, TrustLine } from "../../model";
import { createBatchResolver, eventMatches, ledgerResolver } from "./util";

import { withFilter } from "graphql-subscriptions";

import db from "../../database";
import { pubsub, TRUST_LINE_CREATED, TRUST_LINE_REMOVED, TRUST_LINE_UPDATED } from "../../pubsub";

const accountResolver = createBatchResolver<TrustLine, Account | null>((source: ReadonlyArray<TrustLine>) =>
  db.accounts.findAllByIDs(source.map(r => r.accountID))
);

const trustLineSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
        return eventMatches(variables.args, payload.accountID);
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
    ledger: ledgerResolver
  },
  Subscription: {
    trustLineCreated: trustLineSubscription(TRUST_LINE_CREATED),
    trustLineUpdated: trustLineSubscription(TRUST_LINE_UPDATED),
    trustLineRemoved: trustLineSubscription(TRUST_LINE_REMOVED)
  },
  Query: {
    async trustLines(root: any, args: any, ctx: any, info: any) {
      const account = await db.accounts.findByID(args.id);
      const trustLines = await db.trustLines.findAllByAccountID(args.id);

      if (account !== null) {
        trustLines.unshift(TrustLine.buildFakeNative(account));
      }

      return trustLines;
    }
  }
};
