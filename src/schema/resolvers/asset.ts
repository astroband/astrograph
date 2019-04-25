import { db } from "../../database";
import { IApolloContext } from "../../graphql_server";
import { Asset, AssetID } from "../../model";
import { toFloatAmountString } from "../../util/stellar";
import * as resolvers from "./shared";
import { makeConnection } from "./util";

const holdersResolver = async (root: Asset, args: any, ctx: IApolloContext, info: any) => {
  const balances = await db.assets.findHolders(root.toInput(), args);

  return makeConnection(balances);
};

export default {
  Asset: {
    issuer: resolvers.account,
    lastModifiedIn: resolvers.ledger,
    totalSupply: (asset: Asset) => {
      console.log(asset);
      return toFloatAmountString(asset.totalSupply);
    },
    circulatingSupply: (asset: Asset) => toFloatAmountString(asset.circulatingSupply),
    balances: holdersResolver
  },
  Query: {
    asset: async (root: any, { id }: { id: AssetID }, ctx: IApolloContext, info: any) => {
      return db.assets.findByID(id);
    },
    assets: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const { code, issuer } = args;
      const records = await db.assets.findAll(
        code || issuer ? { code, issuer } : {},
        args
      );

      return makeConnection(records);
    }
  }
};
