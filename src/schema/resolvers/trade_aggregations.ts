import { IHorizonTradeAggregationData } from "../../datasource/types";

export default {
  Query: {
    async tradeAggregations(root: any, args: any, ctx: any, info: any) {
      const { baseAsset, counterAsset, startTime, endTime, resolution, limit } = args;

      let order: "asc" | "desc" = "desc";
      if (args.orderBy) {
        order = args.orderBy.toLowerCase();
      }

      const records = await ctx.dataSources.horizon.getTradeAggregations(
        baseAsset,
        counterAsset,
        startTime,
        endTime,
        resolution,
        limit,
        order
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
