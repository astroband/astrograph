import _ from "lodash";
import { OperationsQuery } from "../../storage/queries/operations";
import { OperationKinds } from "../../storage/queries/operations/types";
import { IApolloContext } from "../../util/types";

export default {
  IOperation: {
    __resolveType(obj: any, context: IApolloContext, info: any) {
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
  Query: {
    operations(root: any, args: any, ctx: IApolloContext, info: any) {
      const { account, first, offset, filters } = args;

      const query = new OperationsQuery(ctx.dgraph, account, filters, first, offset);

      return query.call();
    }
  }
};
