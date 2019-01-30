import _ from "lodash";
import { OperationKinds } from "../../model/operation";
import { Connection } from "../../storage/connection";
import { AccountOperationsQuery } from "../../storage/queries/account_operations";
import { AssetOperationsQuery } from "../../storage/queries/asset_operations";

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
    assetOperations(root: any, args: any, ctx: any, info: any) {
      const { asset, kinds, first, offset } = args;
      const conn = new Connection();

      const query = new AssetOperationsQuery(conn, asset, kinds, first, offset);

      return query.call();
    },
    accountOperations(root: any, args: any, ctx: any, info: any) {
      const { account, kinds, first, offset, filters } = args;
      const conn = new Connection();

      const query = new AccountOperationsQuery(conn, account, kinds, filters, first, offset);

      return query.call();
    }
  }
};
