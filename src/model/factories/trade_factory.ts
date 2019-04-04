import { HorizonAssetType, IHorizonTradeData } from "../../datasource/types";
import { AssetFactory } from "../../model/factories/asset_factory";
import { Trade } from "../../model/trade";
import { calculateOfferPrice } from "../../util/offer";

export class TradeFactory {
  public static fromHorizonResponse(data: IHorizonTradeData) {
    return new Trade({
      ledgerCloseTime: data.ledger_close_time,
      offer: data.offer_id,
      baseOffer: data.base_offer_id,
      baseAccount: data.base_account,
      baseAmount: data.base_amount,
      baseAsset: AssetFactory.fromHorizonResponse(
        data.base_asset_type as HorizonAssetType,
        data.base_asset_code,
        data.base_asset_issuer
      ),
      counterOffer: data.counter_offer_id,
      counterAccount: data.counter_account,
      counterAsset: AssetFactory.fromHorizonResponse(
        data.counter_asset_type as HorizonAssetType,
        data.counter_asset_code,
        data.counter_asset_issuer
      ),
      baseIsSeller: data.base_is_seller,
      price: calculateOfferPrice(data.price.d, data.price.n)
    });
  }
}
