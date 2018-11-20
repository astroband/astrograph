import db from "../../database";

export default {
  Query: {
    async assets(root: any, args: any, ctx: any, info: any) {
      const data = await db.assets.findAll(args.code, args.issuer, args.first, args.offset);

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
