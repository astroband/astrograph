import { withFilter } from "graphql-subscriptions";
import _ from "lodash";

import * as resolvers from "./shared";

import { createBatchResolver, effectsResolver,  eventMatches, makeConnection, operationsResolver } from "./util";

import { IHorizonOperationData } from "../../datasource/types";
import { Account, Balance, DataEntry, Operation } from "../../model";
import { BalanceFactory, OperationFactory } from "../../model/factories";

import { db } from "../../database";
import { joinToMap } from "../../util/array";

import { ACCOUNT, pubsub } from "../../pubsub";

const dataEntriesResolver = createBatchResolver<Account, DataEntry[]>((source: any) =>
  db.dataEntries.findAllByAccountIDs(_.map(source, "id"))
);

const balancesResolver = createBatchResolver<Account, Balance[]>(async (source: Account[]) => {
  const accountIDs = source.map(s => s.id);
  const balances = await db.trustLines.findAllByAccountIDs(accountIDs);

  const map = joinToMap(accountIDs, balances);

  for (const [accountID, accountBalances] of map) {
    const account = source.find((acc: Account) => acc.id === accountID);

    if (!account) {
      continue;
    }

    accountBalances.unshift(BalanceFactory.nativeForAccount(account));
  }

  return balances;
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
    balances: balancesResolver,
    ledger: resolvers.ledger,
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
