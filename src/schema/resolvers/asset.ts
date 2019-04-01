import { IHorizonAssetData } from "../../datasource/types";
import { accountResolver } from "./util";

export default {
  Asset: { issuer: accountResolver },
  AssetWithInfo: { issuer: accountResolver },
  Query: {
    async assets(root: any, args: any, ctx: any, info: any) {
      const { code, issuer, first, last, after, before } = args;
      let records: IHorizonAssetData[] = await ctx.dataSources.horizon.getAssets(
        code || issuer ? { code, issuer } : {},
        first || last,
        last ? "desc" : "asc",
        last ? before : after
      );

      // we must keep ascending ordering, because Horizon doesn't do it,
      // when you request the previous page
      if (last) {
        records = records.reverse();
      }

      const edges = records.map(record => {
        return {
          node: {
            code: record.asset_code,
            issuer: record.asset_issuer,
            native: record.asset_type === "native",
            amount: record.amount,
            numAccounts: record.num_accounts,
            flags: {
              authRequired: record.flags.auth_required,
              authRevokable: record.flags.auth_revocable,
              authImmutable: record.flags.auth_immutable
            }
          },
          cursor: record.paging_token
        };
      });

      return {
        nodes: edges.map(edge => edge.node),
        edges,
        pageInfo: {
          startCursor: records.length !== 0 ? records[0].paging_token : null,
          endCursor: records.length !== 0 ? records[records.length - 1].paging_token : null
        }
      };
    }
  }
};
