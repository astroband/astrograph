import { db } from "../../database";
import { HorizonAssetType, IHorizonTradeData } from "../../datasource/types";
import { Account, Trade } from "../../model";
import { AssetFactory } from "../../model/factories";
import { assetResolver, createBatchResolver } from "./util";

const baseAccountResolver = createBatchResolver<Trade, Account>((source: any) => {
  return db.accounts.findAllByIDs(source.map((t: Trade) => t.baseAccountID))
});

const counterAccountResolver = createBatchResolver<Trade, Account>((source: any) =>
  db.accounts.findAllByIDs(source.map((t: Trade) => t.counterAccountID))
);

export default {
  Trade: {
    baseAsset: assetResolver,
    counterAsset: assetResolver,
    baseAccount: baseAccountResolver,
    counterAccount: counterAccountResolver
  },
  Query: {
    async trades(root: any, args: any, ctx: any, info: any) {
      const { first, last, after, before } = args;
      const { baseAsset, counterAsset, offerID } = args;

      let records = await ctx.dataSources.horizon.getTrades(
        baseAsset,
        counterAsset,
        offerID,
        first || last,
        last ? "asc" : "desc",
        last ? before : after
      );

      // we must keep descending ordering, because Horizon doesn't do it,
      // when you request the previous page
      if (last) {
        records = records.reverse();
      }

      const edges = records.map((record: IHorizonTradeData) => {
        return {
          node: {
            ledgerCloseTime: record.ledger_close_time,
            baseOfferID: record.base_offer_id,
            baseAccountID: record.base_account,
            baseAmount: record.base_amount,
            baseAsset: AssetFactory.fromHorizonResponse(
              record.base_asset_type as HorizonAssetType,
              record.base_asset_code,
              record.base_asset_issuer
            ),
            counterOfferID: record.counter_offer_id,
            counterAccountID: record.counter_account,
            counterAsset: AssetFactory.fromHorizonResponse(
              record.counter_asset_type as HorizonAssetType,
              record.counter_asset_code,
              record.counter_asset_issuer
            ),
          },
          cursor: record.paging_token
        };
      });

      return {
        nodes: edges.map((edge: { cursor: string; node: Trade }) => edge.node),
        edges,
        pageInfo: {
          startCursor: records.length !== 0 ? records[0].paging_token : null,
          endCursor: records.length !== 0 ? records[records.length - 1].paging_token : null
        }
      };
    }
  }
};
