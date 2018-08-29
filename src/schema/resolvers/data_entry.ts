import db from "../../database";
import { Account, DataEntry } from "../../model";
import { createBatchResolver } from "./util";

const accountResolver = createBatchResolver<DataEntry, Account>((source: any) =>
  db.accounts.findAllByIDs(source.map((r: DataEntry) => r.accountID))
);

export default {
  DataEntry: {
    account: accountResolver
  },
  Query: {
    dataEntries(root: any, args: any, ctx: any, info: any) {
      return db.dataEntries.findAllByAccountID(args.id);
    }
  }
};
