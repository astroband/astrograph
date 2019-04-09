import { IHorizonTradeAggregationData } from "../../datasource/types";

export default {
  Query: {
    tradeAggregations: async (root: any, args: any, ctx: any, info: any) => {
      const { baseAsset, counterAsset, startTime, endTime, resolution } = args;

      const records = await ctx.dataSources.horizon.getTradeAggregations(
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
