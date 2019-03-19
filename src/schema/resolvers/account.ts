import { withFilter } from "graphql-subscriptions";
import _ from "lodash";

import { Account, DataEntry, TrustLine } from "../../model";
import { TrustLineFactory } from "../../model/factories";

import { db } from "../../database";
import { joinToMap } from "../../util/array";

import { ACCOUNT, pubsub } from "../../pubsub";

import { createBatchResolver, eventMatches, ledgerResolver, operationsResolver } from "./util";

const dataEntriesResolver = createBatchResolver<Account, DataEntry[]>((source: any) =>
  db.dataEntries.findAllByAccountIDs(_.map(source, "id"))
);

const trustLinesResolver = createBatchResolver<Account, TrustLine[]>(async (source: any) => {
  const accountIDs = _.map(source, "id");
  const trustLines = await db.trustLines.findAllByAccountIDs(accountIDs);

  const map = joinToMap(accountIDs, trustLines);

  for (const [accountID, accountTrustLines] of map) {
    const account = source.find((acc: Account) => acc.id === accountID);
    accountTrustLines.unshift(TrustLineFactory.nativeForAccount(account));
  }

  return trustLines;
});

const accountSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
        return eventMatches(variables.args, payload.id, payload.mutationType);
      }
    ),

    resolve(payload: any, args: any, ctx: any, info: any) {
      return payload;
    }
  };
};

export default {
  Account: {
    data: dataEntriesResolver,
    trustLines: trustLinesResolver,
    ledger: ledgerResolver,
    operations: operationsResolver
  },
  Query: {
    account(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findByID(args.id);
    },
    accounts(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findAllByIDs(args.id);
    }
  },
  Subscription: {
    account: accountSubscription(ACCOUNT)
  }
};
