import { Account, DataEntry } from "../../model2";

import { withFilter } from "graphql-subscriptions";
import { createBatchResolver, eventMatches, ledgerResolver } from "./util";

import { db } from "../../database";

import { DATA_ENTRY, pubsub } from "../../pubsub";

const accountResolver = createBatchResolver<DataEntry, Account>((source: any) =>
  db.accounts.findAllByIDs(source.map((r: DataEntry) => r.accountID))
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
  DataEntry: {
    account: accountResolver,
    ledger: ledgerResolver
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
