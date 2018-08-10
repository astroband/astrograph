import db from "../database";

const signerResolver = {
  Query: {
    signers(root: any, args: any, ctx: any, info: any) {
      return db.signers.findAllByAccountID(args.id);
    }
  }
};

export { signerResolver };
