export type HorizonAccountFlag = "auth_required" | "auth_immutable" | "auth_revocable";

export type HorizonAssetType = "native" | "credit_alphanum4" | "credit_alphanum12";

export interface IHorizonTradeAggregationData {
  timestamp: number;
  trade_count: number;
  base_volume: string;
  counter_volume: string;
  avg: string;
  high: string;
  low: string;
  open: string;
  close: string;
}

export interface IHorizonTradeData {
  id: string;
  paging_token: string;
  ledger_close_time: string;
  offer_id: string;
  base_offer_id: string;
  base_account: string;
  base_amount: string;
  base_asset_type: string;
  base_asset_code: string;
  base_asset_issuer: string;
  counter_offer_id: string;
  counter_account: string;
  counter_amount: string;
  counter_asset_type: string;
  counter_asset_code: string;
  counter_asset_issuer: string;
  base_is_seller: boolean;
  price: {
    n: number;
    d: number;
  };
}
