import { ITrade } from "../../model";
import { ITradeData as IStorageTradeData } from "../../storage/types";

export class TradeFactory {
  public static fromStorage(data: IStorageTradeData): ITrade {
    return {
      id: data.id,
      ledgerCloseTime: data.ledger_close_time,
      offer: data.sold_offer_id.toString(),
      seller: data.seller_id,
      buyer: data.buyer_id,
      amountSold: data.sold,
      amountBought: data.bought,
      assetSold: data.asset_sold.key,
      assetBought: data.asset_bought.key,
      price: data.price
    };
  }
}
