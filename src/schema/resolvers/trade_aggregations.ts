import { IHorizonTradeAggregationData } from "../../datasource/types";
import { IApolloContext } from "../../graphql_server";

export default {
  Query: {
    tradeAggregations: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const { baseAsset, counterAsset, startTime, endTime, resolution } = args;

      const records = await ctx.dataSources.trades.aggregations(
        baseAsset,
        counterAsset,
        startTime,
        endTime,
        resolution,
        args
      );

      return records.map((record: IHorizonTradeAggregationData) => {
        return {
          timeStamp: record.timestamp,
          tradeCount: record.trade_count,
          baseVolume: record.base_volume,
          counterVolume: record.counter_volume,
          avg: record.avg,
          high: record.high,
          low: record.low,
          open: record.open,
          close: record.close
        };
      });
    }
  }
};
