import { db } from "../../database";

import * as resolvers from "./shared";
import { createBatchResolver, makeConnection, memoResolver } from "./util";

import { IHorizonEffectData, IHorizonOperationData, IHorizonTransactionData } from "../../datasource/types";
import { Account, Effect, Operation, Transaction } from "../../model";
import { EffectFactory, OperationFactory, TransactionWithXDRFactory } from "../../model/factories";

export default {
  Transaction: {
    sourceAccount: createBatchResolver<Transaction, Account>((source: any) => {
      return db.accounts.findAllByIDs(source.map((obj: Transaction) => obj.sourceAccount));
    }),
    ledger: resolvers.ledger,
    memo: memoResolver,
    operations: async (root: Transaction, args: any, ctx: any) => {
      return makeConnection<IHorizonOperationData, Operation>(
        await ctx.dataSources.horizon.getTransactionOperations(root.id, args),
        r => OperationFactory.fromHorizon(r)
      );
    },
    payments: async (root: Transaction, args: any, ctx: any) => {
      const records = await ctx.dataSources.horizon.getTransactionPayments(root.id, args);
      return makeConnection<IHorizonOperationData, Operation>(records, r => OperationFactory.fromHorizon(r));
    },
    effects: async (root: Transaction, args: any, ctx: any) => {
      const records = await ctx.dataSources.horizon.getTransactionEffects(root.id, args);
      return makeConnection<IHorizonEffectData, Effect>(records, r => EffectFactory.fromHorizon(r));
    }
  },
  Query: {
    async transaction(root: any, args: any, ctx: any, info: any) {
      const records = await ctx.dataSources.horizon.getTransactionsByIds([args.id]);
      return TransactionWithXDRFactory.fromHorizon(records[0]);
    },
    async transactions(root: any, args: any, ctx: any, info: any) {
      const { first, last, after, before } = args;
      let records = await ctx.dataSources.horizon.getTransactions(
        first || last,
        last ? "asc" : "desc",
        last ? before : after
      );

      // we must keep descending ordering, because Horizon doesn't do it,
      // when you request the previous page
      if (last) {
        records = records.reverse();
      }

      const edges = records.map((record: IHorizonTransactionData) => {
        return {
          node: TransactionWithXDRFactory.fromHorizon(record),
          cursor: record.paging_token
        };
      });

      return {
        nodes: edges.map((edge: { cursor: string; node: Transaction }) => edge.node),
        edges,
        pageInfo: {
          startCursor: records.length !== 0 ? records[0].paging_token : null,
          endCursor: records.length !== 0 ? records[records.length - 1].paging_token : null
        }
      };
    }
  }
};
