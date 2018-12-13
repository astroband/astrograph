import _ from "lodash";
import { Connection } from "../../storage/connection";
import { OperationsQuery } from "../../storage/queries/operations";
import { OperationKinds } from "../../storage/queries/operations/types";

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
      }

      return null;
    }
  },
  Query: {
    operations(root: any, args: any, ctx: any, info: any) {
      const { account, first, offset, filters } = args;
      const conn = new Connection();

      const query = new OperationsQuery(conn, account, filters, first, offset);

      return query.call();
    }
  }
};
