import { withFilter } from "graphql-subscriptions";
import _ from "lodash";
import { OperationFactory } from "../../model/factories/operation_factory";
import { Operation, OperationKinds } from "../../model/operation";
import { NEW_OPERATION, pubsub } from "../../pubsub";

export default {
  IOperation: {
    __resolveType(obj: any, context: any, info: any) {
      switch (obj.kind) {
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
        case OperationKinds.PathPayment:
          return "PathPaymentOperation";
      }

      return null;
    }
  },
  Subscription: {
    operations: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_OPERATION),
        (payload: Operation, variables) => {
          let fit = true;

          if (variables.txSource) {
            fit = fit && payload.txSource === variables.txSource;
          }

          if (variables.opSource) {
            fit = fit && payload.opSource === variables.opSource;
          }

          if (variables.kind) {
            fit = fit && variables.kind.indexOf(payload.kind) !== -1;
          }

          return fit;
        }
      ),

      resolve(payload: any, args: any, ctx: any, info: any) {
        return payload;
      }
    }
  },
  Query: {
    async accountOperations(root: any, args: any, ctx: any, info: any) {
      const { account, first, cursor, order } = args;
      const data = await ctx.dataSources.horizon.getAccountOperations(account, first, order, cursor);

      return data.map(OperationFactory.fromHorizon);
    }
  }
};
