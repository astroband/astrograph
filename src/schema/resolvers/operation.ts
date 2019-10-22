import { withFilter } from "graphql-subscriptions";
import { Asset } from "stellar-base";
import { IApolloContext } from "../../graphql_server";
import { Operation, OperationType, Transaction } from "../../model";
import { OperationFactory, TransactionWithXDRFactory } from "../../model/factories";
import { NEW_OPERATION, pubsub } from "../../pubsub";
import { OperationData as StorageOperationData } from "../../storage/types";
import { makeConnection } from "./util";

import * as resolvers from "./shared";

export default {
  Operation: {
    sourceAccount: resolvers.account,
    transaction: async (operation: Operation, args: any, ctx: IApolloContext) => {
      if (operation.tx instanceof Transaction) {
        return operation.tx;
      }

      const tx = await ctx.storage.transactions.get(operation.tx.id);
      return TransactionWithXDRFactory.fromStorage(tx);
    },
    __resolveType(operation: Operation) {
      switch (operation.type) {
        case OperationType.Payment:
          return "PaymentOperation";
        case OperationType.SetOption:
          return "SetOptionsOperation";
        case OperationType.AccountMerge:
          return "AccountMergeOperation";
        case OperationType.AllowTrust:
          return "AllowTrustOperation";
        case OperationType.BumpSequence:
          return "BumpSequenceOperation";
        case OperationType.ChangeTrust:
          return "ChangeTrustOperation";
        case OperationType.CreateAccount:
          return "CreateAccountOperation";
        case OperationType.ManageData:
          return "ManageDatumOperation";
        case OperationType.ManageSellOffer:
          return "ManageSellOfferOperation";
        case OperationType.ManageBuyOffer:
          return "ManageBuyOfferOperation";
        case OperationType.CreatePassiveSellOffer:
          return "CreatePassiveSellOfferOperation";
        case OperationType.PathPayment:
          return "PathPaymentOperation";
        case OperationType.Inflation:
          return "InflationOperation";
        case OperationType.PathPaymentStrictSend:
          return "PathPaymentStrictSendOperation";
      }

      return null;
    }
  },
  PaymentOperation: {
    destination: resolvers.account,
    asset: resolvers.asset
  },
  SetOptionsOperation: { inflationDestination: resolvers.account },
  AccountMergeOperation: { destination: resolvers.account },
  AllowTrustOperation: { trustor: resolvers.account },
  ChangeTrustOperation: { asset: resolvers.asset },
  CreateAccountOperation: { destination: resolvers.account },
  PathPaymentOperation: {
    destinationAccount: resolvers.account,
    destinationAsset: resolvers.asset,
    sourceAsset: resolvers.asset,
    path: resolvers.asset
  },
  CreatePassiveSellOfferOperation: {
    assetBuying: resolvers.asset,
    assetSelling: resolvers.asset
  },
  ManageSellOfferOperation: {
    assetBuying: resolvers.asset,
    assetSelling: resolvers.asset
  },
  PathPaymentStrictSendOperation: {
    destinationAccount: resolvers.account,
    destinationAsset: resolvers.asset,
    sourceAsset: resolvers.asset
  },
  SetOptionsSigner: { account: resolvers.account },
  Query: {
    operation: async (root: any, args: { id: string }, ctx: IApolloContext) => {
      const doc = await ctx.storage.operations.get(args.id);
      return OperationFactory.fromStorage(doc);
    },
    operations: async (root: any, args: any, ctx: IApolloContext) => {
      const { type, ...paging } = args;
      const storage = ctx.storage.operations;

      if (type) {
        storage.filterTypes(type);
      }

      const docs = await ctx.storage.operations.all(paging);

      return makeConnection<StorageOperationData, Operation>(docs, r => OperationFactory.fromStorage(r));
    }
  },
  Subscription: {
    operations: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_OPERATION),
        (payload: Operation, vars) => {
          if (vars.txSource && !vars.txSource.includes(payload.tx.sourceAccount)) {
            return false;
          }

          if (vars.opSource && !vars.opSource.includes(payload.sourceAccount)) {
            return false;
          }

          if (vars.type && !vars.type.includes(payload.type)) {
            return false;
          }

          if (vars.destination && !("destination" in payload && vars.destination.includes(payload.destination))) {
            return false;
          }

          if (vars.asset) {
            return Object.entries(payload).some(([key, value]) => {
              if (!(value instanceof Asset)) {
                return false;
              }

              return vars.asset.includes(value.toString());
            });
          }

          return true;
        }
      ),

      resolve(payload: any, args: any, ctx: IApolloContext, info: any) {
        return payload;
      }
    }
  }
};
