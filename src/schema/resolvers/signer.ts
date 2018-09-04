import db from "../../database";
import { Account, Signer } from "../../model";
import { createBatchResolver } from "./util";

const accountResolver = createBatchResolver<Signer, Account>((source: any) =>
  db.accounts.findAllByIDs(source.map((r: Signer) => r.accountID))
);

const signerResolver = createBatchResolver<Signer, Account>((source: any) =>
  db.accounts.findAllByIDs(source.map((r: Signer) => r.signer))
);

export default {
  Signer: {
    account: accountResolver,
    signer: signerResolver
  },
  Query: {
    async signers(root: any, args: any, ctx: any, info: any) {
      const account = await db.accounts.findByID(args.id);
      const signers = await db.signers.findAllByAccountID(args.id);

      if (account !== null) {
        signers.unshift(
          new Signer({
            accountid: account.id,
            publickey: account.id,
            weight: account.thresholds.masterWeight
          })
        );
      }

      return signers;
    }
  }
};
