import { Connection as DgraphConnection } from "../../storage/connection";
import { AccountPaymentsQuery } from "../../storage/queries/account_payments";
import { assetResolver } from "./util";

export default {
  PaymentOperation: {
    asset: assetResolver
  },
  Query: {
    accountPayments(root: any, args: any, ctx: any, info: any) {
      const dc = new DgraphConnection();
      const { first, offset, ...params } = args;
      const query = new AccountPaymentsQuery(dc, params, first, offset);

      return query.call();
    }
  }
};
