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
    signers(root: any, args: any, ctx: any, info: any) {
      const accountPromise = db.accounts.findByID(args.id);
      const signersPromise = db.signers.findAllByAccountID(args.id);

      return Promise.all([accountPromise, signersPromise]).then(values => {
        const [account, signers] = values;

        signers.unshift(
          new Signer({
            accountid: account.id,
            publickey: account.id,
            weight: account.thresholds.masterWeight
          })
        );

        return signers;
      });
    }
  }
};
