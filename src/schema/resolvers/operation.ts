import { Connection as DgraphConnection } from "../../storage/connection";
import { AccountPaymentsQuery } from "../../storage/queries/account_payments";

export default {
  Query: {
    accountPayments(root: any, args: any, ctx: any, info: any) {
      const dc = new DgraphConnection();
      const query = new AccountPaymentsQuery(dc, args.id, args.first, args.offset);

      return query.call();
    }
  }
};
