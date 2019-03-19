import { withFilter } from "graphql-subscriptions";
import { Asset } from "stellar-base";
import { Operation, OperationKinds } from "../../model/operation";
import { NEW_OPERATION, pubsub } from "../../pubsub";

export default {
  Operation: {
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
        (payload: Operation, vars) => {
          if (vars.txSource && !vars.txSource.includes(payload.txSource)) {
            return false;
          }

          if (vars.opSource && !vars.opSource.includes(payload.opSource)) {
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
