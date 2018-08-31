import { Account, TrustLine } from "../../model";
import { createBatchResolver, ledgerResolver } from "./util";

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
        return payload.accountID === variables.id;
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
      const accountPromise = db.accounts.findByID(args.id);
      const trustLinesPromise = db.trustLines.findAllByAccountID(args.id);

      return Promise.all([accountPromise, trustLinesPromise]).then(values => {
        const [account, trustLines] = values;
        trustLines.unshift(TrustLine.buildFakeNative(account));

        return trustLines;
      });
    }
  }
};
