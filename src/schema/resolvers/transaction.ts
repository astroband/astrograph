import db from "../../database";
import { ledgerLinkResolver } from "./util";

export default {
  Transaction: {
    ledger: ledgerLinkResolver
  },
  Query: {
    transaction(root: any, args: any, ctx: any, info: any) {
      return db.transactions.findByID(args.id);
    }
  }
};
