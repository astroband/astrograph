import { withFilter } from "graphql-subscriptions";
import { Asset } from "stellar-base";
import { IHorizonOperationData } from "../../datasource/types";
import { IApolloContext } from "../../graphql_server";
import { Operation, OperationType, Transaction } from "../../model";
import { OperationFactory, TransactionWithXDRFactory } from "../../model/factories";
import { NEW_OPERATION, pubsub } from "../../pubsub";
import { makeConnection } from "./util";

import * as resolvers from "./shared";

export default {
  Operation: {
    sourceAccount: resolvers.account,
    transaction: async (operation: Operation, args: any, ctx: IApolloContext) => {
      if (operation.tx instanceof Transaction) {
        return operation.tx;
      }

      const records = await ctx.dataSources.transactions.byIds([operation.tx.id]);
      return TransactionWithXDRFactory.fromHorizon(records[0]);
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
      }

      return null;
    }
  },
  PaymentOperation: { destination: resolvers.account },
  SetOptionsOperation: { inflationDestination: resolvers.account },
  AccountMergeOperation: { destination: resolvers.account },
  AllowTrustOperation: { trustor: resolvers.account },
  ChangeTrustOperation: { asset: resolvers.asset },
  CreateAccountOperation: { destination: resolvers.account },
  PathPaymentOperation: { destinationAccount: resolvers.account },
  SetOptionsSigner: { account: resolvers.account },
  ManageBuyOfferOperation: { assetSelling: resolvers.asset, assetBuying: resolvers.asset },
  ManageSellOfferOperation: { assetSelling: resolvers.asset, assetBuying: resolvers.asset },
  Query: {
    operation: async (root: any, args: { id: string }, ctx: IApolloContext) => {
      const response = await ctx.dataSources.operations.byId(args.id);
      return OperationFactory.fromHorizon(response);
    },
    operations: async (root: any, args: any, ctx: IApolloContext) => {
      return makeConnection<IHorizonOperationData, Operation>(await ctx.dataSources.operations.all(args), r =>
        OperationFactory.fromHorizon(r)
      );
    },
    payments: async (root: any, args: any, ctx: IApolloContext) => {
      return makeConnection<IHorizonOperationData, Operation>(await ctx.dataSources.payments.all(args), r =>
        OperationFactory.fromHorizon(r)
      );
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
