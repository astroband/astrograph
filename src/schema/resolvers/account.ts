import { fieldsList } from "graphql-fields-list";
import { withFilter } from "graphql-subscriptions";
import { getRepository, In } from "typeorm";

import { account as accountResolver, ledger as ledgerResolver } from "./shared";

import { createBatchResolver, eventMatches, makeConnection } from "./util";

import { IBalance, ITrade, Operation, PaymentOperations, Transaction } from "../../model";
import { BalanceFactory, OperationFactory, TradeFactory, TransactionWithXDRFactory } from "../../model/factories";
import { Account, Asset, Offer, TrustLine } from "../../orm/entities";
import {
  ITradeData as IStorageTradeData,
  ITransactionData as IStorageTransactionData,
  OperationData as StorageOperationData
} from "../../storage/types";

import { IApolloContext } from "../../graphql_server";
import { ACCOUNT, pubsub } from "../../pubsub";
import { getReservedBalance } from "../../util/base_reserve";
import { AssetTransformer } from "../../util/orm";
import { paginate } from "../../util/paging";
import { toFloatAmountString } from "../../util/stellar";

const balancesResolver = createBatchResolver<Account, IBalance[]>(async (source: Account[]) => {
  const accountIDs = source.map(s => s.id);
  const trustlines = await getRepository(TrustLine).find({ where: { account: In(accountIDs) } });
  const allBalances: IBalance[][] = [];

  for (const id of accountIDs) {
    const account = source.find(acc => acc.id === id);

    if (!account) {
      continue;
    }

    const balances: IBalance[] = trustlines.filter(t => t.account === id);
    balances.unshift(BalanceFactory.nativeForAccount(account));

    allBalances.push(balances);
  }

  return allBalances;
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
      const assets = await getRepository(Asset).find({ issuer: root.id });
      return makeConnection(assets);
    },
    balances: balancesResolver,
    ledger: ledgerResolver,
    operations: async (root: Account, args: any, ctx: IApolloContext) => {
      const { type, ...paging } = args;
      const storage = ctx.storage.operations;

      if (type) {
        storage.filterTypes(type);
      }

      return makeConnection<StorageOperationData, Operation>(await storage.forAccount(root.id).all(paging), r =>
        OperationFactory.fromStorage(r)
      );
    },
    payments: async (root: Account, args: any, ctx: IApolloContext) => {
      return makeConnection<StorageOperationData, Operation>(
        await ctx.storage.operations
          .forAccount(root.id)
          .filterTypes(PaymentOperations)
          .all(args),
        r => OperationFactory.fromStorage(r)
      );
    },
    transactions: async (root: Account, args: any, ctx: IApolloContext) => {
      return makeConnection<IStorageTransactionData, Transaction>(
        await ctx.storage.transactions.forAccount(root.id).all(args),
        r => TransactionWithXDRFactory.fromStorage(r)
      );
    },
    trades: async (root: Account, args: any, ctx: IApolloContext, info: any) => {
      const trades = await ctx.storage.trades.forAccount(root.id).all(args);
      return makeConnection<IStorageTradeData, ITrade>(trades, r => TradeFactory.fromStorage(r));
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
    inflationDestination: accountResolver
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
