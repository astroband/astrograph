import { db } from "../../database";
import { IHorizonTransactionData } from "../../datasource/types";
import { Account, Transaction } from "../../model";
import { TransactionWithXDRFactory } from "../../model/factories";
import { createBatchResolver, ledgerResolver, memoResolver, operationsResolver } from "./util";

export default {
  Transaction: {
    sourceAccount: createBatchResolver<Transaction, Account>((source: any) => {
      return db.accounts.findAllByIDs(source.map((obj: Transaction) => obj.sourceAccount));
    }),
    ledger: ledgerResolver,
    memo: memoResolver,
    operations: operationsResolver
  },
  Query: {
    async transaction(root: any, args: any, ctx: any, info: any) {
      const records = await ctx.dataSources.horizon.getTransactionsByIds([args.id]);
      return TransactionWithXDRFactory.fromHorizon(records[0]);
    },
    async transactions(root: any, args: any, ctx: any, info: any) {
      const { first, last, after, before } = args;
      let records = await ctx.dataSources.horizon.getTransactions(
        first || last,
        last ? "asc" : "desc",
        last ? before : after
      );

      // we must keep descending ordering, because Horizon doesn't do it,
      // when you request the previous page
      if (last) {
        records = records.reverse();
      }

      const edges = records.map((record: IHorizonTransactionData) => {
        return {
          node: TransactionWithXDRFactory.fromHorizon(record),
          cursor: record.paging_token
        };
      });

      return {
        nodes: edges.map((edge: { cursor: string; node: Transaction }) => edge.node),
        edges,
        pageInfo: {
          startCursor: records.length !== 0 ? records[0].paging_token : null,
          endCursor: records.length !== 0 ? records[records.length - 1].paging_token : null
        }
      };
    }
  }
};
