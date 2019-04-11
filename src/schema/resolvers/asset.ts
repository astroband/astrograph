import { IHorizonAssetData } from "../../datasource/types";
import * as resolvers from "./shared";
import { makeConnection } from "./util";

export default {
  Asset: { issuer: resolvers.account },
  AssetWithInfo: { issuer: resolvers.account },
  Query: {
    assets: async (root: any, args: any, ctx: any, info: any) => {
      const { code, issuer } = args;
      const records: IHorizonAssetData[] = await ctx.dataSources.assets.all(
        code || issuer ? { code, issuer } : {},
        args
      );

      return makeConnection(records, (r: IHorizonAssetData) => {
        return {
          code: r.asset_code,
          issuer: r.asset_issuer,
          native: r.asset_type === "native",
          amount: r.amount,
          numAccounts: r.num_accounts,
          flags: {
            authRequired: r.flags.auth_required,
            authRevokable: r.flags.auth_revocable,
            authImmutable: r.flags.auth_immutable
          }
        };
      });
    }
  }
};
