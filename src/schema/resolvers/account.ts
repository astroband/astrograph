import _ from "lodash";
import { Account, DataEntry, Signer, TrustLine } from "../../model";

import { withFilter } from "graphql-subscriptions";
import { createBatchResolver, eventMatches, ledgerResolver } from "./util";

import { joinToMap } from "../../util/array";

import { ACCOUNT, pubsub } from "../../pubsub";
import { IApolloContext } from "../../util/types";

const signersResolver = createBatchResolver<Account, Signer[]>(async (source: any, args: any, ctx: IApolloContext) => {
  const accountIDs = _.map(source, "id");
  const signers = await ctx.db.signers.findAllByAccountIDs(accountIDs);

  const map = joinToMap(accountIDs, signers);

  for (const [accountID, accountSigners] of map) {
    const account = source.find((acc: Account) => acc.id === accountID);
    accountSigners.unshift(
      new Signer({
        accountid: account.id,
        publickey: account.id,
        weight: account.thresholds.masterWeight
      })
    );
  }

  return signers;
});

const dataEntriesResolver = createBatchResolver<Account, DataEntry[]>((source: any, args: any, ctx: IApolloContext) =>
  ctx.db.dataEntries.findAllByAccountIDs(_.map(source, "id"))
);

const trustLinesResolver = createBatchResolver<Account, TrustLine[]>(
  async (source: any, args: any, ctx: IApolloContext) => {
    const accountIDs = _.map(source, "id");
    const trustLines = await ctx.db.trustLines.findAllByAccountIDs(accountIDs);

    const map = joinToMap(accountIDs, trustLines);

    for (const [accountID, accountTrustLines] of map) {
      const account = source.find((acc: Account) => acc.id === accountID);
      accountTrustLines.unshift(TrustLine.buildFakeNative(account));
    }

    return trustLines;
  }
);

const accountSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
        return eventMatches(variables.args, payload.id, payload.mutationType);
      }
    ),

    resolve(payload: any, args: any, ctx: IApolloContext, info: any) {
      return payload;
    }
  };
};

const signerForResolver = async (subject: Account, args: any, ctx: IApolloContext) => {
  const accounts = ctx.db.accounts.findAllBySigner(subject.id, args.first);
  return [subject].concat(await accounts);
};

export default {
  Account: {
    signers: signersResolver,
    data: dataEntriesResolver,
    trustLines: trustLinesResolver,
    ledger: ledgerResolver,
    signerFor: signerForResolver
  },
  Query: {
    account(root: any, args: any, ctx: IApolloContext, info: any) {
      return ctx.db.accounts.findByID(args.id);
    },
    accounts(root: any, args: any, ctx: IApolloContext, info: any) {
      return ctx.db.accounts.findAllByIDs(args.id);
    },
    async accountsSignedBy(root: any, args: any, ctx: IApolloContext, info: any) {
      const account = await ctx.db.accounts.findByID(args.id);

      if (!account) {
        return [];
      }

      return [account].concat(await ctx.db.accounts.findAllBySigner(args.id, args.first));
    }
  },
  Subscription: {
    account: accountSubscription(ACCOUNT)
  }
};
