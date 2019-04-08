import { withFilter } from "graphql-subscriptions";
import _ from "lodash";

import resolvers from "./shared";

import { IHorizonOperationData } from "../../datasource/types";
import { Account, DataEntry, Operation, TrustLine } from "../../model";
import { OperationFactory, TrustLineFactory } from "../../model/factories";

import { db } from "../../database";
import { joinToMap } from "../../util/array";

import { ACCOUNT, pubsub } from "../../pubsub";

import {
  createBatchResolver,
  effectsResolver,  
  eventMatches,
  ledgerResolver,
  makeConnection,
  operationsResolver
} from "./util";

const dataEntriesResolver = createBatchResolver<Account, DataEntry[]>((source: any) =>
  db.dataEntries.findAllByAccountIDs(_.map(source, "id"))
);

const trustLinesResolver = createBatchResolver<Account, TrustLine[]>(async (source: Account[]) => {
  const accountIDs = source.map(s => s.id);
  const trustLines = await db.trustLines.findAllByAccountIDs(accountIDs);

  const map = joinToMap(accountIDs, trustLines);

  for (const [accountID, accountTrustLines] of map) {
    const account = source.find((acc: Account) => acc.id === accountID);

    if (!account) {
      continue;
    }

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
    operations: operationsResolver,
    async payments(root: Account, args: any, ctx: any) {
      const records = await ctx.dataSources.horizon.getAccountPayments(root.id, args);
      return makeConnection<IHorizonOperationData, Operation>(records, r => OperationFactory.fromHorizon(r));
    },
    effects: effectsResolver,
    inflationDestination: resolvers.account
  },
  Query: {
    async account(root: any, args: any, ctx: any, info: any) {
      const acc = await db.accounts.findByID(args.id);
      return acc;
    },
    accounts(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findAllByIDs(args.id);
    }
  },
  Subscription: {
    account: accountSubscription(ACCOUNT)
  }
};
