import { withFilter } from "graphql-subscriptions";
import _ from "lodash";

import { Account, DataEntry, Signer, TrustLine } from "../../model";
import { OperationFactory, SignerFactory, TrustLineFactory } from "../../model/factories";

import { db } from "../../database";
import { IHorizonOperationData } from "../../datasource/types";
import { joinToMap } from "../../util/array";

import { ACCOUNT, pubsub } from "../../pubsub";

import { createBatchResolver, eventMatches, ledgerResolver } from "./util";

const signersResolver = createBatchResolver<Account, Signer[]>(async (source: any) => {
  const accountIDs = _.map(source, "id");
  const signers = await db.signers.findAllByAccountIDs(accountIDs);

  const map = joinToMap(accountIDs, signers);

  for (const [accountID, accountSigners] of map) {
    const account = source.find((acc: Account) => acc.id === accountID);
    accountSigners.unshift(SignerFactory.self(account.id, account.thresholds.masterWeight));
  }

  return signers;
});

const dataEntriesResolver = createBatchResolver<Account, DataEntry[]>((source: any) =>
  db.dataEntries.findAllByAccountIDs(_.map(source, "id"))
);

const trustLinesResolver = createBatchResolver<Account, TrustLine[]>(async (source: any) => {
  const accountIDs = _.map(source, "id");
  const trustLines = await db.trustLines.findAllByAccountIDs(accountIDs);

  const map = joinToMap(accountIDs, trustLines);

  for (const [accountID, accountTrustLines] of map) {
    const account = source.find((acc: Account) => acc.id === accountID);
    accountTrustLines.unshift(TrustLineFactory.nativeForAccount(account));
  }

  return trustLines;
});

const accountSubscription = (event: string) => {
  return {
    subscribe: withFilter(
      () => pubsub.asyncIterator([event]),
      (payload, variables) => {
        return eventMatches(variables.args, payload.id, payload.mutationType);
      }
    ),

    resolve(payload: any, args: any, ctx: any, info: any) {
      return payload;
    }
  };
};

export default {
  Account: {
    data: dataEntriesResolver,
    trustLines: trustLinesResolver,
    ledger: ledgerResolver,
    signerFor: signerForResolver,
    operationsConnection: async (subject: Account, args: any, ctx: any) => {
      const { first, after, last, before } = args;
      let data = await ctx.dataSources.horizon.getAccountOperations(
        subject.id,
        first || last,
        last ? "asc" : "desc",
        last ? before : after
      );

      // we must keep descending ordering, because Horizon doesn't do it,
      // when you request the previous page
      data = data.sort((a: IHorizonOperationData, b: IHorizonOperationData) => {
        const [aDate, bDate] = [new Date(a.created_at), new Date(b.created_at)];
        return bDate.getTime() - aDate.getTime();
      });

      return {
        edges: data.map((record: IHorizonOperationData) => {
          return {
            node: OperationFactory.fromHorizon(record),
            cursor: record.paging_token
          };
        }),
        pageInfo: {
          endCursor: data[data.length - 1].paging_token
        }
      };
    }
  },
  Query: {
    account(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findByID(args.id);
    },
    accounts(root: any, args: any, ctx: any, info: any) {
      return db.accounts.findAllByIDs(args.id);
    },
    async accountsSignedBy(root: any, args: any, ctx: any, info: any) {
      const account = await db.accounts.findByID(args.id);

      if (!account) {
        return [];
      }

      return [account].concat(await db.accounts.findAllBySigner(args.id, args.first));
    }
  },
  Subscription: {
    account: accountSubscription(ACCOUNT)
  }
};
