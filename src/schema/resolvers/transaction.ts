import { Memo } from "stellar-sdk";

import { IApolloContext } from "../../graphql_server";

import * as resolvers from "./shared";
import { makeConnection } from "./util";

import { IHorizonEffectData, IHorizonTransactionData } from "../../datasource/types";
import { Effect, Operation, Transaction } from "../../model";
import { EffectFactory, OperationFactory, TransactionWithXDRFactory } from "../../model/factories";
import { IOperationData as IStorageOperationData } from "../../storage/types";

export default {
  Transaction: {
    sourceAccount: resolvers.account,
    ledger: resolvers.ledger,
    memo: (obj: any) => {
      if (!obj.memo) {
        return null;
      }

      const memo = obj.memo as Memo;

      return {
        type: memo.type,
        value: memo.getPlainValue()
      };
    },
    operations: async (root: Transaction, args: any, ctx: IApolloContext) => {
      return makeConnection<IStorageOperationData, Operation>(
        await ctx.storage.operations.forTransaction(root.id, args),
        r => OperationFactory.fromStorage(r)
      );
    },
    effects: async (root: Transaction, args: any, ctx: IApolloContext) => {
      const records = await ctx.dataSources.effects.forTransaction(root.id, args);
      return makeConnection<IHorizonEffectData, Effect>(records, r => EffectFactory.fromHorizon(r));
    }
  },
  Query: {
    transaction: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const records = await ctx.dataSources.transactions.byIds([args.id]);
      return TransactionWithXDRFactory.fromHorizon(records[0]);
    },
    transactions: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const records = await ctx.dataSources.transactions.all(args);
      return makeConnection<IHorizonTransactionData, Transaction>(records, r =>
        TransactionWithXDRFactory.fromHorizon(r)
      );
    }
  }
};
