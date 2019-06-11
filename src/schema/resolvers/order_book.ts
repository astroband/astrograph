import { IApolloContext } from "../../graphql_server";

export default {
  Query: {
    orderBook: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const { buying, selling, limit } = args;
      return ctx.orderBook.load(selling, buying, limit);
    }
  }
};
