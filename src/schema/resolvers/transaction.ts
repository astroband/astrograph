import db from "../../database";

export default {
  Query: {
    transaction(root: any, args: any, ctx: any, info: any) {
      return db.transactions.findByID(args.id);
    }
  }
};
