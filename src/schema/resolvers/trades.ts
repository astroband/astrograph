import { fieldsList } from "graphql-fields-list";
import { db } from "../../database";
import { HorizonAssetType, IHorizonTradeData } from "../../datasource/types";
import { Offer, Trade } from "../../model";
import { AssetFactory } from "../../model/factories";
import { accountResolver, assetResolver, createBatchResolver } from "./util";
import { calculateOfferPrice } from "../../util/offer";

export const offerResolver = createBatchResolver<any, Offer[]>((source: any, args: any, context: any, info: any) => {
  const requestedFields = fieldsList(info);
  const ids: string[] = source.map((s: any) => s[info.fieldName]);

  // if user requested only "id", we can return it right away
  if (requestedFields.length === 1 && requestedFields[0] === "id") {
    return ids.map(id => (id ? { id } : null));
  }

  return db.offers.findAllByIDs(ids);
});

export default {
  Trade: {
    baseAsset: assetResolver,
    counterAsset: assetResolver,
    baseAccount: accountResolver,
    counterAccount: accountResolver,
    offer: offerResolver,
    baseOffer: offerResolver,
    counterOffer: offerResolver
  },
  Account: {
    async trades(root: any, args: any, ctx: any, info: any) {
      //const { first, last, after, before } = args;

      return {};
    }
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
            offer: record.offer_id,
            baseOffer: record.base_offer_id,
            baseAccount: record.base_account,
            baseAmount: record.base_amount,
            baseAsset: AssetFactory.fromHorizonResponse(
              record.base_asset_type as HorizonAssetType,
              record.base_asset_code,
              record.base_asset_issuer
            ),
            counterOffer: record.counter_offer_id,
            counterAccount: record.counter_account,
            counterAsset: AssetFactory.fromHorizonResponse(
              record.counter_asset_type as HorizonAssetType,
              record.counter_asset_code,
              record.counter_asset_issuer
            ),
            baseIsSeller: record.base_is_seller,
            price: calculateOfferPrice(record.price.d, record.price.n)
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
