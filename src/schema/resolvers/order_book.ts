export default {
  Query: {
    async orderBook(root: any, args: any, ctx: any, info: any) {
      const r = await ctx.dataSources.horizon.getOrderBook(
        { code: "USD", issuer: "GBSTRUSD7IRX73RQZBL3RQUH6KS3O4NYFY3QCALDLZD77XMZOPWAVTUK"},
        { code: "native" }
      );

      return {
        bids: r.bids,
        asks: r.asks
      };
    }
  }
};
