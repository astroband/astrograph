import { IApolloContext } from "../../util/types";

export default {
  Query: {
    async assets(root: any, args: any, ctx: IApolloContext, info: any) {
      const data = await ctx.db.assets.findAll(args.code, args.issuer, args.first, args.offset);

      return data.map(asset => {
        return {
          code: asset.getCode(),
          issuer: asset.getIssuer(),
          native: asset.isNative()
        };
      });
    }
  }
};
