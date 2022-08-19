import axios from "axios";
import { withFilter } from "graphql-subscriptions";
import { Memo, Networks, Transaction as Tx, xdr } from "stellar-base";

import { IApolloContext } from "../../graphql_server";

import * as resolvers from "./shared";
import { makeConnection } from "./util";

import { Operation, PaymentOperations, Transaction } from "../../model";
import { OperationFactory, TransactionWithXDRFactory } from "../../model/factories";
import { NEW_TRANSACTION, pubsub } from "../../pubsub";
import { OperationsStorage } from "../../storage";
import { ITransactionData, OperationData } from "../../storage/types";
import { STELLAR_HTTP_ENDPOINT, STELLAR_NETWORK } from "../../util/secrets";

export default {
  Transaction: {
    sourceAccount: resolvers.account,
    feeAccount: resolvers.account,
    ledger: resolvers.ledger,
    memo: (obj: any) => {
      if (!obj.memo) {
        return null;
      }

      const memo = obj.memo as Memo;
      const type = memo.type;
      const value = memo.value instanceof Buffer ? memo.value.toString("hex") : memo.value;

      return { type, value };
    },
    operations: async (root: Transaction, args: any, ctx: IApolloContext) => {
      return makeConnection<OperationData, Operation>(await OperationsStorage.forTransaction(root.id, args), r =>
        OperationFactory.fromStorage(r)
      );
    },
    payments: async (root: Transaction, args: any, ctx: IApolloContext) => {
      return makeConnection<OperationData, Operation>(
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
      return ctx.storage.transactions.findById(args.id);
    },
    transactions: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      return makeConnection<ITransactionData, Transaction>(await ctx.storage.transactions.all(args), r =>
        TransactionWithXDRFactory.fromStorage(r)
      );
    }
  },
  Subscription: {
    transactions: {
      resolve(payload: Transaction) {
        return payload;
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_TRANSACTION),
        (payload: Transaction, args) => {
          if (!args.id) {
            return true;
          }

          return args.id === payload.id;
        }
      )
    }
  },
  Mutation: {
    submitTransaction: async (root: any, args: any) => {
      const coreResponse = await axios({
        baseURL: STELLAR_HTTP_ENDPOINT,
        url: "/tx",
        method: "POST",
        params: { blob: args.envelopeBase64 }
      });

      const status = coreResponse.data.status;
      const tx = new Tx(args.envelopeBase64, Networks[STELLAR_NETWORK]);

      const response: { status: string; hash: string; error?: string } = {
        status,
        hash: tx.hash().toString("hex")
      };

      if (status === "ERROR") {
        response.error = xdr.TransactionResult.fromXDR(coreResponse.data.error, "base64")
          .result()
          .switch().name;
      }

      return response;
    }
  }
};
