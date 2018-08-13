import { Account, Signer } from "../../model";

import { createBatchResolver } from "graphql-resolve-batch";
import db from "../../database";

const signersResolver = createBatchResolver<Account, Signer[]>(
  async (source: ReadonlyArray<Account>, args: any, context: any) => {
    const res = await db.signers.findAllByAccountIDs(source.map(r => r.id));
    return res;
  }
);

export default {
  Account: {
    signers: signersResolver
  },
  Query: {
    account(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findByID(args.id);
    }
  }
};
