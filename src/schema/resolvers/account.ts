import { fieldsList } from "graphql-fields-list";
import { withFilter } from "graphql-subscriptions";
import _ from "lodash";
import { getRepository } from "typeorm";

import * as resolvers from "./shared";

import { createBatchResolver, eventMatches, makeConnection } from "./util";

import { IHorizonOperationData, IHorizonTradeData, IHorizonTransactionData } from "../../datasource/types";

import { Balance, Operation, Trade, Transaction } from "../../model";
import { BalanceFactory, OperationFactory, TradeFactory, TransactionWithXDRFactory } from "../../model/factories";
import { Account, Offer } from "../../orm/entities";

import { db } from "../../database";
import { IApolloContext } from "../../graphql_server";
import { ACCOUNT, pubsub } from "../../pubsub";
import { joinToMap } from "../../util/array";
import { getReservedBalance } from "../../util/base_reserve";
import { AssetTransformer } from "../../util/orm";
import { paginate } from "../../util/paging";
import { toFloatAmountString } from "../../util/stellar";

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
    reservedBalance: (root: Account) => toFloatAmountString(getReservedBalance(root.numSubentries)),
    assets: async (root: Account, args: any) => {
      const assets = await db.assets.findAll({ issuer: root.id }, args);
      return makeConnection(assets);
    },
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
    offers: async (root: Account, args: any, ctx: any) => {
      const { selling, buying, ...paging } = args;

      const qb = getRepository(Offer).createQueryBuilder("offers");

      qb.where("offers.seller = :seller", { seller: root.id });

      if (selling) {
        qb.andWhere("offers.selling = :selling", { selling: AssetTransformer.to(selling) });
      }

      if (buying) {
        qb.andWhere("offers.buying = :buying", { buying: AssetTransformer.to(buying) });
      }

      const offers = await paginate(qb, paging, "offers.id", Offer.parsePagingToken);

      return makeConnection<Offer>(offers);
    },
    inflationDestination: resolvers.account
  },
  Query: {
    account(root: any, args: any, ctx: IApolloContext, info: any) {
      const relations = fieldsList(info).indexOf("data") !== -1 ? ["data"] : [];

      return getRepository(Account).findOne(args.id, { relations });
    },
    accounts: async (root: any, args: any) => {
      const { ids, inflationDestination, homeDomain, data, ...paging } = args;
      const qb = getRepository(Account).createQueryBuilder("accounts");

      if (ids && ids.length !== 0) {
        qb.whereInIds(ids);
      }

      if (homeDomain) {
        qb.andWhere("decode(accounts.homedomain, 'base64') = :homeDomain", { homeDomain });
      }

      if (inflationDestination) {
        qb.andWhere("accounts.inflationdest = :inflationDestination", { inflationDestination });
      }

      if (data) {
        qb.innerJoinAndSelect("accounts.data", "data");
        if (data.name) {
          qb.andWhere("decode(data.name, 'base64') = :name", { name: data.name });
        }
        if (data.value) {
          qb.andWhere("decode(data.value, 'base64') = :value", { value: data.value });
        }
      }

      return makeConnection<Account>(await paginate(qb, paging, "accounts.id"));
    }
  },
  Subscription: {
    account: accountSubscription(ACCOUNT)
  }
};
