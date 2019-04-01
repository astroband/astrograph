export default {
  Query: {
    async orderBook(root: any, args: any, ctx: any, info: any) {
      const { buying, selling } = args;

      const r = await ctx.dataSources.horizon.getOrderBook(
        { code: selling.code, issuer: selling.issuer },
        { code: buying.code, issuer: buying.issuer }
      );

      return {
        bids: r.bids,
        asks: r.asks
      };
    }
  }
};
