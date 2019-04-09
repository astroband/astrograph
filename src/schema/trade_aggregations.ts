import { gql } from "apollo-server";

export const typeDefs = gql`
  "Represent [trade aggregation](https://www.stellar.org/developers/horizon/reference/endpoints/trade_aggregations.html)"
  type TradeAggregation {
    "Start time for this trade_aggregation. Represented as milliseconds since epoch"
    timeStamp: Int!
    "Total number of trades aggregated"
    tradeCount: Int!
    "Total volume of base asset"
    baseVolume: Float!
    "Total volume of counter asset"
    counterVolume: Float!
    "weighted average price of counter asset in terms of base asset"
    avg: Float!
    "highest price for this time period"
    high: Float!
    "lowest price for this time period"
    low: Float!
    "price as seen on first trade aggregated"
    open: Float!
    "price as seen on last trade aggregated"
    close: Float!
  }

  extend type Query {
    "Get collected trade aggregations"
    tradeAggregations(
      baseAsset: AssetInput!
      counterAsset: AssetInput!
      "Lower time boundary represented as millis since epoch"
      startTime: Int
      "Upper time boundary represented as millis since epoch"
      endTime: Int
      """
      Segment duration as millis since epoch.
      Supported values are:

      - 1 minute (60000)
      - 5 minutes (300000)
      - 15 minutes (900000)
      - 1 hour (3600000)
      - 1 day (86400000)
      - 1 week (604800000)
      """
      resolution: Int!
      first: Int
      last: Int
    ): [TradeAggregation!]
  }

`;
