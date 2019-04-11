import { Memo } from "stellar-sdk";

import { db } from "../../database";

import * as resolvers from "./shared";
import { createBatchResolver, makeConnection } from "./util";

import { IHorizonEffectData, IHorizonOperationData, IHorizonTransactionData } from "../../datasource/types";
import { Account, Effect, Operation, Transaction } from "../../model";
import { EffectFactory, OperationFactory, TransactionWithXDRFactory } from "../../model/factories";

export default {
  Transaction: {
    sourceAccount: createBatchResolver<Transaction, Account>((source: any) => {
      return db.accounts.findAllByIDs(source.map((obj: Transaction) => obj.sourceAccount));
    }),
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
    operations: async (root: Transaction, args: any, ctx: any) => {
      return makeConnection<IHorizonOperationData, Operation>(
        await ctx.dataSources.operations.forTransaction(root.id, args),
        r => OperationFactory.fromHorizon(r)
      );
    },
    payments: async (root: Transaction, args: any, ctx: any) => {
      const records = await ctx.dataSources.payments.forTransaction(root.id, args);
      return makeConnection<IHorizonOperationData, Operation>(records, r => OperationFactory.fromHorizon(r));
    },
    effects: async (root: Transaction, args: any, ctx: any) => {
      const records = await ctx.dataSources.effects.forTransaction(root.id, args);
      return makeConnection<IHorizonEffectData, Effect>(records, r => EffectFactory.fromHorizon(r));
    }
  },
  Query: {
    transaction: async (root: any, args: any, ctx: any, info: any) => {
      const records = await ctx.dataSources.transactions.byIds([args.id]);
      return TransactionWithXDRFactory.fromHorizon(records[0]);
    },
    transactions: async (root: any, args: any, ctx: any, info: any) => {
      const records = await ctx.dataSources.transactions.all(args);
      return makeConnection<IHorizonTransactionData, Transaction>(records, r =>
        TransactionWithXDRFactory.fromHorizon(r)
      );
    }
  }
};
