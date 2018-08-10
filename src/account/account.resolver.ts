import db from "../database";

const accountResolver = {
  Query: {
    account(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findByID(args.id);
    },
  }
};

export { accountResolver };
