import db from "../../database";
import { Account, Signer } from "../../model";
import { createBatchResolver } from "./util";

const accountResolver = createBatchResolver<Signer, Account>((source: any) =>
  db.accounts.findAllByIDs(source.map((r: Signer) => r.accountID))
);

export default {
  Signer: {
    account: accountResolver
  },
  Query: {
    signers(root: any, args: any, ctx: any, info: any) {
      return db.signers.findAllByAccountID(args.id);
    }
  }
};
