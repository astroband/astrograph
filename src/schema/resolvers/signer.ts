import db from "../../database";

export default {
  Query: {
    signers(root: any, args: any, ctx: any, info: any) {
      return db.signers.findAllByAccountID(args.id);
    }
  }
};
