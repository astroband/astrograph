import db from "../../database";
import { Connection } from "../../storage/connection";
import { AccountTransactionsQuery } from "../../storage/queries/account_transactions";
import { ledgerResolver } from "./util";

export default {
  Transaction: {
    ledger: ledgerResolver
  },
  Query: {
    transaction(root: any, args: any, ctx: any, info: any) {
      return db.transactions.findByID(args.id);
    },
    transactions(root: any, args: any, ctx: any, info: any) {
      return db.transactions.findAllByID(args.id);
    },
    accountTransactions(root: any, args: any, ctx: any, info: any) {
      const c = new Connection();
      const query = new AccountTransactionsQuery(c, args.id, args.first, args.offset);

      return query.call();
    }
  }
};
