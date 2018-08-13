import { Account, Signer } from "../../model";

import { createBatchResolver } from "graphql-resolve-batch";
import db from "../../database";

export default {
  Account: {
    signers: createBatchResolver<Account, Signer[]>(async (source: any, args: any, context: any) => {
      const signers = await db.signers.findAllByAccountID(source[0].id);
      return [signers];
    })
  },
  Query: {
    account(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findByID(args.id);
    }
  }
};
