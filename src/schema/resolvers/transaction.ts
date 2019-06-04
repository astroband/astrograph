import { Memo } from "stellar-sdk";

import { IApolloContext } from "../../graphql_server";

import * as resolvers from "./shared";
import { makeConnection } from "./util";

import { IHorizonOperationData, IHorizonTransactionData } from "../../datasource/types";
import { Operation, Transaction } from "../../model";
import { OperationFactory, TransactionWithXDRFactory } from "../../model/factories";

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
      return makeConnection<IHorizonOperationData, Operation>(
        await ctx.dataSources.operations.forTransaction(root.id, args),
        r => OperationFactory.fromHorizon(r)
      );
    },
    payments: async (root: Transaction, args: any, ctx: IApolloContext) => {
      const records = await ctx.dataSources.payments.forTransaction(root.id, args);
      return makeConnection<IHorizonOperationData, Operation>(records, r => OperationFactory.fromHorizon(r));
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
