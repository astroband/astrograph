import { db } from "../../database";
import { IHorizonTransactionData } from "../../datasource/types";
import { Account, Transaction } from "../../model";
import { TransactionWithXDRFactory } from "../../model/factories";
import { createBatchResolver, ledgerResolver, memoResolver, operationsResolver, assetResolver } from "./util";

export default {
  Trade: {
    baseAsset: assetResolver,
    counterAsset: assetResolver
  },
  Query: {
    // async trades(root: any, args: any, ctx: any, info: any) {
    //   const { first, last, after, before } = args;
    //   let records = await ctx.dataSources.horizon.getTransactions(
    //     first || last,
    //     last ? "asc" : "desc",
    //     last ? before : after
    //   );

    //   // we must keep descending ordering, because Horizon doesn't do it,
    //   // when you request the previous page
    //   if (last) {
    //     records = records.reverse();
    //   }

    //   const edges = records.map((record: IHorizonTransactionData) => {
    //     return {
    //       node: TransactionWithXDRFactory.fromHorizon(record),
    //       cursor: record.paging_token
    //     };
    //   });

    //   return {
    //     nodes: edges.map((edge: { cursor: string; node: Transaction }) => edge.node),
    //     edges,
    //     pageInfo: {
    //       startCursor: records.length !== 0 ? records[0].paging_token : null,
    //       endCursor: records.length !== 0 ? records[records.length - 1].paging_token : null
    //     }
    //   };
    // }
  }
};
