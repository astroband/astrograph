export default {
  Query: {
    orderBook: async (root: any, args: any, ctx: any, info: any) => {
      const { buying, selling, limit } = args;

      const r = await ctx.dataSources.horizon.getOrderBook(
        { code: selling.code, issuer: selling.issuer },
        { code: buying.code, issuer: buying.issuer },
        limit
      );

      return {
        bids: r.bids,
        asks: r.asks
      };
    }
  }
};
