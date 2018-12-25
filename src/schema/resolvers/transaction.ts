import { AccountTransactionsQuery } from "../../storage/queries/account_transactions";
import { IApolloContext } from "../../util/types";
import { ledgerResolver, memoResolver } from "./util";

export default {
  Transaction: {
    ledger: ledgerResolver,
    memo: memoResolver
  },
  Query: {
    transaction(root: any, args: any, ctx: IApolloContext, info: any) {
      return ctx.db.transactions.findByID(args.id);
    },
    transactions(root: any, args: any, ctx: IApolloContext, info: any) {
      return ctx.db.transactions.findAllByID(args.id);
    },
    accountTransactions(root: any, args: any, ctx: IApolloContext, info: any) {
      const query = new AccountTransactionsQuery(ctx.dgraph, args.id, args.first, args.offset);

      return query.call();
    }
  }
};
