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
      const records = await ctx.dataSources.horizon.getTransactions([args.id]);
      return TransactionWithXDRFactory.fromHorizon(records[0]);
    },
    async transactions(root: any, args: any, ctx: any, info: any) {
      const records = await ctx.dataSources.horizon.getTransactions(args.ids);
      return records.map((tx: IHorizonTransactionData) => TransactionWithXDRFactory.fromHorizon(tx));
    }
  }
};
