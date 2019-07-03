import { getRepository } from "typeorm";
import { IApolloContext } from "../../graphql_server";
import { AssetID, Balance } from "../../model";
import { Asset, TrustLine } from "../../orm/entities";
import { paginate } from "../../util/paging";
import { toFloatAmountString } from "../../util/stellar";
import * as resolvers from "./shared";
import { makeConnection } from "./util";

const holdersResolver = async (root: Asset, args: any, ctx: IApolloContext, info: any) => {
  const qb = getRepository(TrustLine).createQueryBuilder("trustlines");

  qb
    .where("trustlines.assetCode = :code", { code: root.code })
    .andWhere("trustlines.issuer = :issuer", { issuer: root.issuer });

  const balances = await paginate<TrustLine>(qb, args, ["balance", "account"], Balance.parsePagingToken);

  return makeConnection<TrustLine>(balances);
};

export default {
  Asset: {
    issuer: resolvers.account,
    lastModifiedIn: resolvers.ledger,
    totalSupply: (asset: Asset) => toFloatAmountString(asset.total_supply),
    circulatingSupply: (asset: Asset) => toFloatAmountString(asset.circulating_supply),
    balances: holdersResolver
  },
  Query: {
    asset: async (root: any, { id }: { id: AssetID }, ctx: IApolloContext, info: any) => {
      return getRepository(Asset).findOne(id);
    },
    assets: async (root: any, args: any, ctx: IApolloContext, info: any) => {
      console.log(Asset, TrustLine);
      const { code, issuer, ...paging } = args;

      const qb = getRepository(Asset).createQueryBuilder("assets");

      if (code) {
        qb.andWhere("assets.code = :code", { code });
      }

      if (issuer) {
        qb.andWhere("assets.issuer = :issuer", { issuer });
      }

      const assets = await paginate(qb, paging, "assets.assetid");

      return makeConnection<Asset>(assets);
    }
  }
};
