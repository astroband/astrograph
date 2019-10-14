import { getRepository } from "typeorm";
import { IApolloContext } from "../../graphql_server";
import { AssetID } from "../../model";
import { Asset, TrustLine } from "../../orm/entities";
import { paginate } from "../../util/paging";
import { toFloatAmountString } from "../../util/stellar";
import * as resolvers from "./shared";
import { makeConnection } from "./util";

const holdersResolver = async (root: Asset, args: any, ctx: IApolloContext, info: any) => {
  const qb = getRepository(TrustLine).createQueryBuilder("tl");

  qb.where("tl.assetCode = :code", { code: root.code }).andWhere("tl.issuer = :issuer", { issuer: root.issuer });

  const balances = await paginate(qb, args, ["tl.balance", "tl.account"], TrustLine.parsePagingToken);

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
  Query: {
    asset: async (root: any, { id }: { id: AssetID }, ctx: IApolloContext, info: any) => {
      return getRepository(Asset).findOne({ id });
    },
    assets: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      const { code, issuer, ...paging } = args;
      const qb = getRepository(Asset).createQueryBuilder("assets");

      if (code) {
        qb.andWhere("assets.code = :code", { code });
      }

      if (issuer) {
        qb.andWhere("assets.issuer = :issuer", { issuer });
      }

      const records = await paginate(qb, paging, "assets.id");

      return makeConnection(records);
    }
  }
};
