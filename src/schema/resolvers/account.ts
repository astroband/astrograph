import { Account, DataEntry, Signer, TrustLine } from "../../model";

import { withFilter } from "graphql-subscriptions";
import { createBatchResolver, eventMatches, ledgerResolver } from "./util";

import { joinToMap } from "../../common/util/array";
import db from "../../database";

import { ACCOUNT_CREATED, ACCOUNT_REMOVED, ACCOUNT_UPDATED, pubsub } from "../../pubsub";

const fetchIDs = (r: any) => r.id;

const signersResolver = createBatchResolver<Account, Signer[]>(async (source: any) => {
  const accountIDs = source.map(fetchIDs);
  const signers = await db.signers.findAllByAccountIDs(accountIDs);

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

const dataEntriesResolver = createBatchResolver<Account, DataEntry[]>((source: any) =>
  db.dataEntries.findAllByAccountIDs(source.map(fetchIDs))
);

const trustLinesResolver = createBatchResolver<Account, TrustLine[]>(async (source: any) => {
  const accountIDs = source.map(fetchIDs);
  const trustLines = await db.trustLines.findAllByAccountIDs(accountIDs);

  const map = joinToMap(accountIDs, trustLines);

  for (const [accountID, accountTrustLines] of map) {
    const account = source.find((acc: Account) => acc.id === accountID);
    accountTrustLines.unshift(TrustLine.buildFakeNative(account));
  }

  return trustLines;
});

const accountSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
        return eventMatches(variables.args, payload.id);
      }
    ),

    resolve(payload: any, args: any, ctx: any, info: any) {
      return payload;
    }
  };
};

export default {
  Account: {
    signers: signersResolver,
    data: dataEntriesResolver,
    trustLines: trustLinesResolver,
    ledger: ledgerResolver
  },
  Query: {
    account(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findByID(args.id);
    },
    accounts(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findAllByIDs(args.id);
    }
  },
  Subscription: {
    accountCreated: accountSubscription(ACCOUNT_CREATED),
    accountUpdated: accountSubscription(ACCOUNT_UPDATED),
    accountRemoved: accountSubscription(ACCOUNT_REMOVED)
  }
};
