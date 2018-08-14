import { Account, TrustLine } from "../../model";

import { createBatchResolver } from "graphql-resolve-batch";
import db from "../../database";

const accountResolver = createBatchResolver<TrustLine, Account | null>(
  async (source: ReadonlyArray<TrustLine>, args: any, context: any) => {
    const res = await db.accounts.findAllByIDs(source.map(r => r.accountid));
    return res;
  }
);

export default {
  TrustLine: {
    account: accountResolver
  }
};
