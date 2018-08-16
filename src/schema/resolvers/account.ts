import { Account, DataEntry, Signer, TrustLine } from "../../model";

import { createBatchResolver } from "graphql-resolve-batch";
import { withFilter } from "graphql-subscriptions";

import db from "../../database";
import { ACCOUNT_CREATED, ACCOUNT_REMOVED, ACCOUNT_UPDATED, pubsub } from "../../pubsub";

const signersResolver = createBatchResolver<Account, Signer[]>(
  async (source: ReadonlyArray<Account>, args: any, context: any) => {
    const res = await db.signers.findAllByAccountIDs(source.map(r => r.id));
    return res;
  }
);

const dataEntriesResolver = createBatchResolver<Account, DataEntry[]>(
  async (source: ReadonlyArray<Account>, args: any, context: any) => {
    const res = await db.dataEntries.findAllByAccountIDs(source.map(r => r.id));
    return res;
  }
);

const trustLinesResolver = createBatchResolver<Account, TrustLine[]>(
  async (source: ReadonlyArray<Account>, args: any, context: any) => {
    const res = await db.trustLines.findAllByAccountIDs(source.map(r => r.id));
    return res;
  }
);

const accountSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
        return payload.id === variables.id;
      }
    ),

    resolve(payload: any, args: any, ctx: any, info: any) {
      return payload;
    }
  };
};

export default {
  Account: {
    signers: signersResolver,
    data: dataEntriesResolver,
    trustLines: trustLinesResolver
  },
  Query: {
    account(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findByID(args.id);
    }
  },
  Subscription: {
    accountCreated: accountSubscription(ACCOUNT_CREATED),
    accountUpdated: accountSubscription(ACCOUNT_UPDATED),
    accountRemoved: accountSubscription(ACCOUNT_REMOVED)
  }
};
