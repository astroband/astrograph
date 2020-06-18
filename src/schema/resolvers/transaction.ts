import stellar from "stellar-base";

import { IApolloContext } from "../../graphql_server";

import * as resolvers from "./shared";
import { makeConnection } from "./util";

import { Operation, PaymentOperations, Transaction } from "../../model";
import { OperationFactory, TransactionWithXDRFactory } from "../../model/factories";
import { OperationsStorage } from "../../storage";
import {
  ITransactionData as IStorageTransactionData,
  OperationData as StorageOperationData
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
      return makeConnection<StorageOperationData, Operation>(
        await OperationsStorage.forTransaction(root.id, args),
        r => OperationFactory.fromStorage(r)
      );
    },
    payments: async (root: Transaction, args: any, ctx: IApolloContext) => {
      return makeConnection<StorageOperationData, Operation>(
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
      return await ctx.storage.transactions.findById(args.id);
    },
    transactions: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const records = await ctx.storage.transactions.all(args);
      return makeConnection<IStorageTransactionData, Transaction>(records, r =>
        TransactionWithXDRFactory.fromStorage(r)
      );
    }
  }
};
