import { IHorizonTransactionData } from "../../datasource/types";
import { Transaction } from "../../model";
import { TransactionWithXDRFactory } from "../../model/factories";
import { ledgerResolver, memoResolver } from "./util";

export default {
  Transaction: {
    ledger: ledgerResolver,
    memo: memoResolver
  },
  Query: {
    async transaction(root: any, args: any, ctx: any, info: any) {
      const records = await ctx.dataSources.horizon.getTransactionsById([args.id]);
      return TransactionWithXDRFactory.fromHorizon(records[0]);
    },
    async transactions(root: any, args: any, ctx: any, info: any) {
      const { first, last, after, before } = args;
      const records = await ctx.dataSources.horizon.getTransactions(
        first || last,
        last ? "asc" : "desc",
        last ? before : after
      );

      return {
        edges: records
          .map((record: IHorizonTransactionData) => {
            return {
              node: TransactionWithXDRFactory.fromHorizon(record),
              cursor: record.paging_token
            };
          })
          .sort((a: { node: Transaction }, b: { node: Transaction }) => {
            // we must keep descending ordering, because Horizon doesn't do it,
            // when you request the previous page
            if (b.node.ledgerSeq !== a.node.ledgerSeq) {
              return b.node.ledgerSeq - a.node.ledgerSeq;
            }

            return b.node.index - a.node.index;
          }),
        pageInfo: {
          endCursor: records[records.length - 1].paging_token
        }
      };
    }
  }
};
