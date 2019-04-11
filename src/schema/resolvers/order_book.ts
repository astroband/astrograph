export default {
  Query: {
    orderBook: async (root: any, args: any, ctx: any, info: any) => {
      const { buying, selling, limit } = args;
      const r = await ctx.dataSources.orderBook.row(selling, buying, limit);

      return { bids: r.bids, asks: r.asks };
    }
  }
};
