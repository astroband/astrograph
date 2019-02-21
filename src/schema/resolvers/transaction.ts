import { db } from "../../database";
import { ledgerResolver, memoResolver } from "./util";

export default {
  Transaction: {
    ledger: ledgerResolver,
    memo: memoResolver
  },
  Query: {
    transaction(root: any, args: any, ctx: any, info: any) {
      return db.transactions.findByID(args.id);
    },
    transactions(root: any, args: any, ctx: any, info: any) {
      return db.transactions.findAllByID(args.id);
    }
  }
};
