import { Account, TrustLine } from "../../model";

import { createBatchResolver } from "graphql-resolve-batch";
import { withFilter } from "graphql-subscriptions";

import db from "../../database";
import { TRUST_LINE_CREATED, TRUST_LINE_REMOVED, TRUST_LINE_UPDATED, pubsub } from "../../pubsub";

const accountResolver = createBatchResolver<TrustLine, Account | null>(
  async (source: ReadonlyArray<TrustLine>, args: any, context: any) => {
    const res = await db.accounts.findAllByIDs(source.map(r => r.accountID));
    return res;
  }
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
    account: accountResolver
  },
  Subscription: {
    trustLineCreated: trustLineSubscription(TRUST_LINE_CREATED),
    trustLineUpdated: trustLineSubscription(TRUST_LINE_UPDATED),
    trustLineRemoved: trustLineSubscription(TRUST_LINE_REMOVED)
  }
};
