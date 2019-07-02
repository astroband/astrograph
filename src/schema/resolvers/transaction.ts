import stellar from "stellar-base";

import { IApolloContext } from "../../graphql_server";

import * as resolvers from "./shared";
import { makeConnection } from "./util";

import { Operation, PaymentOperations, Transaction } from "../../model";
import { OperationFactory, TransactionWithXDRFactory } from "../../model/factories";
import {
  IOperationData as IStorageOperationData,
  ITransactionData as IStorageTransactionData
} from "../../storage/types";

export default {
  Transaction: {
    sourceAccount: resolvers.account,
    ledger: resolvers.ledger,
    memo: (obj: any) => {
      if (!obj.memo) {
        return null;
      }

      const memo = obj.memo as stellar.Memo;

      return {
        type: memo.type,
        value: memo.getPlainValue()
      };
    },
    operations: async (root: Transaction, args: any, ctx: IApolloContext) => {
      return makeConnection<IStorageOperationData, Operation>(
        await ctx.storage.operations.forTransaction(root.id).all(args),
        r => OperationFactory.fromStorage(r)
      );
    },
    payments: async (root: Transaction, args: any, ctx: IApolloContext) => {
      return makeConnection<IStorageOperationData, Operation>(
        await ctx.storage.operations
          .forTransaction(root.id)
          .filterTypes(PaymentOperations)
          .all(args),
        r => OperationFactory.fromStorage(r)
      );
    }
  },
  Query: {
    transaction: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const tx = await ctx.storage.transactions.get(args.id);
      return TransactionWithXDRFactory.fromStorage(tx);
    },
    transactions: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const records = await ctx.storage.transactions.all(args);
      return makeConnection<IStorageTransactionData, Transaction>(records, r =>
        TransactionWithXDRFactory.fromStorage(r)
      );
    }
  }
};
