import _ from "lodash";
import { db } from "../../database";
import { Account, Signer } from "../../model2";
import { SignerFactory } from "../../model2/factories";
import { createBatchResolver } from "./util";

const accountResolver = createBatchResolver<Signer, Account>((source: any) =>
  db.accounts.findAllByIDs(_.map(source, "accountID"))
);

const signerResolver = createBatchResolver<Signer, Account>((source: any) =>
  db.accounts.findAllByIDs(_.map(source, "signer"))
);

export default {
  Signer: {
    account: accountResolver,
    signer: signerResolver
  },
  Query: {
    async signers(root: any, args: any, ctx: any, info: any) {
      const account = await db.accounts.findByID(args.id);

      if (!account) {
        return [];
      }

      const signers = await db.signers.findAllByAccountID(args.id);
      signers.unshift(SignerFactory.self(account.id, account.thresholds.masterWeight));

      return signers;
    }
  }
};
