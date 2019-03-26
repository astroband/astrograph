import { withFilter } from "graphql-subscriptions";
import { Asset } from "stellar-base";
import { Operation, OperationKinds, Transaction } from "../../model";
import { TransactionWithXDRFactory } from "../../model/factories";
import { NEW_OPERATION, pubsub } from "../../pubsub";
import { accountResolver } from "./util";

export default {
  Operation: {
    sourceAccount: accountResolver,
    async transaction(operation: Operation, args: any, ctx: any) {
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
  PaymentOperation: { destination: accountResolver },
  SetOptionsOperation: { inflationDestination: accountResolver },
  AccountMergeOperation: { destination: accountResolver },
  AllowTrustOperation: { trustor: accountResolver },
  CreateAccountOperation: { destination: accountResolver },
  PathPaymentOperation: { destinationAccount: accountResolver },
  SetOptionsSigner: { account: accountResolver },
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
