import { db } from "../../database";
import { IHorizonAssetData } from "../../datasource/types";
import { IApolloContext } from "../../graphql_server";
import { Asset, AssetID } from "../../model";
import { toFloatAmountString } from "../../util/stellar";
import * as resolvers from "./shared";
import { makeConnection } from "./util";

const holdersResolver = async (root: Asset, args: any, ctx: IApolloContext, info: any) => {
  const balances = await db.assets.findHolders(root, args);

  return makeConnection(balances);
};

export default {
  Asset: {
    issuer: resolvers.account,
    lastModifiedIn: resolvers.ledger,
    totalSupply: (asset: Asset) => toFloatAmountString(asset.totalSupply),
    circulatingSupply: (asset: Asset) => toFloatAmountString(asset.circulatingSupply),
    balances: holdersResolver
  },
  AssetWithInfo: { issuer: resolvers.account, balances: holdersResolver },
  Query: {
    asset: async (root: any, { id }: { id: AssetID }, ctx: IApolloContext, info: any) => {
      return db.assets.findByID(id);
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
            authRevokable: r.flags.auth_revocable,
            authImmutable: r.flags.auth_immutable
          }
        };
      });
    }
  }
};
