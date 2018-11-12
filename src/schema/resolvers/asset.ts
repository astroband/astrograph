import { Connection as DgraphConnection } from "../../storage/connection";
import { AssetsQuery } from "../../storage/queries/assets";

export default {
  Query: {
    async assets(root: any, args: any, ctx: any, info: any) {
      const dc = new DgraphConnection();
      const query = new AssetsQuery(dc, args.first, args.code, args.issuer, args.offset);

      const data = await query.call();

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
