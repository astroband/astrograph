import _ from "lodash";
import { db } from "../../database";
import { Account, Signer } from "../../model";
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
  }
};
