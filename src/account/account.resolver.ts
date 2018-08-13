import db from "../database";
import Account from "./account.model";
import Signer from "../signer/signer.model";
import { createBatchResolver } from "graphql-resolve-batch";

const accountResolver = {
  Account: {
    signers: createBatchResolver<Account, Signer[]>(async (source: any, args: any, context: any) => {
      //const id = (source as Account[]).map(s => s.id);
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

export { accountResolver };
