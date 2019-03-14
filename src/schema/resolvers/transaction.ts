import { IHorizonTransactionData } from "../../datasource/types";
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
      const records = await ctx.dataSources.horizon.getTransactions(args.first, args.order || "desc", args.after);

      return {
        edges: records.map((record: IHorizonTransactionData) => {
          return {
            node: TransactionWithXDRFactory.fromHorizon(record),
            cursor: record.paging_token
          };
        }),
        pageInfo: {
          endCursor: records[records.length - 1].paging_token
        }
      };
    }
  }
};
