import { withFilter } from "graphql-subscriptions";
import _ from "lodash";
import { getRepository } from "typeorm";

import * as resolvers from "./shared";

import { createBatchResolver, eventMatches, makeConnection } from "./util";

import {
  IHorizonEffectData,
  IHorizonOperationData,
  IHorizonTradeData,
  IHorizonTransactionData
} from "../../datasource/types";

import { Account, Balance, DataEntry, Effect, Operation, Trade, Transaction } from "../../model";
import {
  BalanceFactory,
  EffectFactory,
  OperationFactory,
  TradeFactory,
  TransactionWithXDRFactory
} from "../../model/factories";
import { Account as AccountEntity } from "../../orm/entities/account";

import { db } from "../../database";
import { IApolloContext } from "../../graphql_server";
import { ACCOUNT, pubsub } from "../../pubsub";
import { joinToMap } from "../../util/array";
import { getReservedBalance } from "../../util/base_reserve";
import { parseCursorPagination, properlyOrdered } from "../../util/paging";
import { toFloatAmountString } from "../../util/stellar";

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

    accountBalances.unshift(await BalanceFactory.nativeForAccount(account));
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

    resolve(payload: any) {
      return payload;
    }
  };
};

export default {
  Account: {
    homeDomain: (root: Account) => Buffer.from(root.homeDomain, "base64").toString(),
    reservedBalance: (root: Account) => toFloatAmountString(getReservedBalance(root.numSubentries)),
    assets: async (root: Account, args: any) => {
      const assets = await db.assets.findAll({ issuer: root.id }, args);
      return makeConnection(assets);
    },
    data: dataEntriesResolver,
    balances: balancesResolver,
    ledger: resolvers.ledger,
    operations: async (root: Account, args: any, ctx: IApolloContext) => {
      return makeConnection<IHorizonOperationData, Operation>(
        await ctx.dataSources.operations.forAccount(root.id, args),
        r => OperationFactory.fromHorizon(r)
      );
    },
    payments: async (root: Account, args: any, ctx: IApolloContext) => {
      const records = await ctx.dataSources.payments.forAccount(root.id, args);
      return makeConnection<IHorizonOperationData, Operation>(records, r => OperationFactory.fromHorizon(r));
    },
    effects: async (root: Account, args: any, ctx: IApolloContext) => {
      const records = await ctx.dataSources.effects.forAccount(root.id, args);
      return makeConnection<IHorizonEffectData, Effect>(records, r => EffectFactory.fromHorizon(r));
    },
    transactions: async (root: Account, args: any, ctx: IApolloContext) => {
      return makeConnection<IHorizonTransactionData, Transaction>(
        await ctx.dataSources.transactions.forAccount(root.id, args),
        r => TransactionWithXDRFactory.fromHorizon(r)
      );
    },
    trades: async (root: Account, args: any, ctx: IApolloContext, info: any) => {
      return makeConnection<IHorizonTradeData, Trade>(await ctx.dataSources.trades.forAccount(root.id, args), r =>
        TradeFactory.fromHorizon(r)
      );
    },

    inflationDestination: resolvers.account
  },
  Query: {
    account: async (root: any, args: any) => {
      return getRepository(AccountEntity).findOne(args.id);
    },
    accounts: async (root: any, args: any) => {
      const { ids, homeDomain, ...paging } = args;
      const qb = getRepository(AccountEntity).createQueryBuilder("accounts");
      const { limit, order } = parseCursorPagination(paging);

      qb.orderBy("accounts.accountid", order).take(limit);

      if (ids && ids.length !== 0) {
        qb.where("accounts.accountid IN (:...ids)", { ids });
      }

      if (homeDomain) {
        qb.andWhere("decode(accounts.homedomain, 'base64') = :homeDomain", { homeDomain });
      }

      if (paging.after) {
        qb.andWhere("accounts.accountid > :cursor", { cursor: paging.after });
      } else if (paging.before) {
        qb.andWhere("accounts.accountid < :cursor", { cursor: paging.before });
      }

      const accounts = properlyOrdered(await qb.getMany(), paging);

      return makeConnection<Account>(accounts);
    }
  },
  Subscription: {
    account: accountSubscription(ACCOUNT)
  }
};
