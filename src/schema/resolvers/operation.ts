import { withFilter } from "graphql-subscriptions";
import { Asset } from "stellar-base";
import { IHorizonOperationData } from "../../datasource/types";
import { Operation, OperationKinds, Transaction } from "../../model";
import { OperationFactory, TransactionWithXDRFactory } from "../../model/factories";
import { NEW_OPERATION, pubsub } from "../../pubsub";
import { makeConnection } from "./util";

import * as resolvers from "./shared";

export default {
  Operation: {
    sourceAccount: resolvers.account,
    transaction: async (operation: Operation, args: any, ctx: any) => {
      if (operation.tx instanceof Transaction) {
        return operation.tx;
      }

      const records = await ctx.dataSources.horizon.getTransactionsByIds([operation.tx.id]);
      return TransactionWithXDRFactory.fromHorizon(records[0]);
    },
    __resolveType(operation: Operation) {
      switch (operation.kind) {
        case OperationKinds.Payment:
          return "PaymentOperation";
        case OperationKinds.SetOption:
          return "SetOptionsOperation";
        case OperationKinds.AccountMerge:
          return "AccountMergeOperation";
        case OperationKinds.AllowTrust:
          return "AllowTrustOperation";
        case OperationKinds.BumpSequence:
          return "BumpSequenceOperation";
        case OperationKinds.ChangeTrust:
          return "ChangeTrustOperation";
        case OperationKinds.CreateAccount:
          return "CreateAccountOperation";
        case OperationKinds.ManageData:
          return "ManageDatumOperation";
        case OperationKinds.ManageOffer:
          return "ManageOfferOperation";
        case OperationKinds.CreatePassiveOffer:
          return "CreatePassiveOfferOperation";
        case OperationKinds.PathPayment:
          return "PathPaymentOperation";
      }

      return null;
    }
  },
  PaymentOperation: { destination: resolvers.account },
  SetOptionsOperation: { inflationDestination: resolvers.account },
  AccountMergeOperation: { destination: resolvers.account },
  AllowTrustOperation: { trustor: resolvers.account },
  CreateAccountOperation: { destination: resolvers.account },
  PathPaymentOperation: { destinationAccount: resolvers.account },
  SetOptionsSigner: { account: resolvers.account },
  Query: {
    operation: async (root: any, args: { id: string }, ctx: any) => {
      const response = await ctx.dataSources.operations.byId(args.id);
      return OperationFactory.fromHorizon(response);
    },
    operations: async (root: any, args: { id: string }, ctx: any) => {
      return makeConnection<IHorizonOperationData, Operation>(await ctx.dataSources.operations.all(args), r =>
        OperationFactory.fromHorizon(r)
      );
    },
    payments: async (root: any, args: any, ctx: any) => {
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

          if (vars.kind && !vars.kind.includes(payload.kind)) {
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

      resolve(payload: any, args: any, ctx: any, info: any) {
        return payload;
      }
    }
  }
};
