import _ from "lodash";
import { Account, DataEntry, TrustLine } from "../../model";
import { TrustLineFactory } from "../../model/factories";

import { withFilter } from "graphql-subscriptions";
import { createBatchResolver, eventMatches, ledgerResolver } from "./util";

import { db } from "../../database";
import { joinToMap } from "../../util/array";

import { ACCOUNT, pubsub } from "../../pubsub";

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
    ledger: ledgerResolver
  },
  Query: {
    account(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findByID(args.id);
    },
    accounts(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findAllByIDs(args.id);
    },
    async accountsSignedBy(root: any, args: any, ctx: any, info: any) {
      const account = await db.accounts.findByID(args.id);

      if (!account) {
        return [];
      }

      return [account].concat(await db.accounts.findAllBySigner(args.id, args.first));
    }
  },
  Subscription: {
    account: accountSubscription(ACCOUNT)
  }
};
