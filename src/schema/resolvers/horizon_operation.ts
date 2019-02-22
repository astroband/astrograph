import _ from "lodash";
import { OperationFactory } from "../../model/factories/operation_factory";
import { OperationKinds } from "../../model/operation";

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
  Query: {
    async accountOperations(root: any, args: any, ctx: any, info: any) {
      const { account, first, cursor, order } = args;
      const data = await ctx.dataSources.horizon.getAccountOperations(account, first, order, cursor);

      return data.map(OperationFactory.fromHorizon);
    }
  }
};
