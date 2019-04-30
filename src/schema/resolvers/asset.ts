import { Asset } from "stellar-sdk";
import { db } from "../../database";
import { IHorizonAssetData } from "../../datasource/types";
import { IApolloContext } from "../../graphql_server";
import { AssetID } from "../../model";
import { AssetFactory } from "../../model/factories";
import * as resolvers from "./shared";
import { makeConnection } from "./util";

const holdersResolver = async (root: Asset, args: any, ctx: IApolloContext, info: any) => {
  const balances = await db.assets.findHolders(root, args);

  return makeConnection(balances);
};

export default {
  Asset: { issuer: resolvers.account, balances: holdersResolver },
  AssetWithInfo: { issuer: resolvers.account, balances: holdersResolver },
  Query: {
    asset: async (root: any, args: { id: AssetID }, ctx: IApolloContext, info: any) => {
      return AssetFactory.fromId(args.id);
    },
    assets: async (root: any, args: any, ctx: IApolloContext, info: any) => {
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
            authRevocable: r.flags.auth_revocable,
            authImmutable: r.flags.auth_immutable
          }
        };
      });
    }
  }
};
