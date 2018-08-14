import { Account, DataEntry, Signer, TrustLine } from "../../model";

import { createBatchResolver } from "graphql-resolve-batch";
import db from "../../database";

const signersResolver = createBatchResolver<Account, Signer[]>(
  async (source: ReadonlyArray<Account>, args: any, context: any) => {
    const res = await db.signers.findAllByAccountIDs(source.map(r => r.id));
    return res;
  }
);

const dataEntriesResolver = createBatchResolver<Account, DataEntry[]>(
  async (source: ReadonlyArray<Account>, args: any, context: any) => {
    const res = await db.dataEntries.findAllByAccountIDs(source.map(r => r.id));
    return res;
  }
);

const trustLinesResolver = createBatchResolver<Account, TrustLine[]>(
  async (source: ReadonlyArray<Account>, args: any, context: any) => {
    const res = await db.trustLines.findAllByAccountIDs(source.map(r => r.id));
    return res;
  }
);

export default {
  Account: {
    signers: signersResolver,
    data: dataEntriesResolver,
    trustLines: trustLinesResolver
  },
  Query: {
    account(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findByID(args.id);
    }
  }
};
