import { Account, Signer } from "../../model";
import { IApolloContext } from "../../util/types";
import { createBatchResolver } from "./util";

const accountResolver = createBatchResolver<Signer, Account>((source: any, args: any, ctx: IApolloContext) =>
  ctx.db.accounts.findAllByIDs(source.map((r: Signer) => r.accountID))
);

const signerResolver = createBatchResolver<Signer, Account>((source: any, args: any, ctx: IApolloContext) =>
  ctx.db.accounts.findAllByIDs(source.map((r: Signer) => r.signer))
);

export default {
  Signer: {
    account: accountResolver,
    signer: signerResolver
  },
  Query: {
    async signers(root: any, args: any, ctx: IApolloContext, info: any) {
      const account = await ctx.db.accounts.findByID(args.id);

      if (account !== null) {
        const signers = await ctx.db.signers.findAllByAccountID(args.id);

        signers.unshift(
          new Signer({
            accountid: account.id,
            publickey: account.id,
            weight: account.thresholds.masterWeight
          })
        );

        return signers;
      }

      return [];
    }
  }
};
