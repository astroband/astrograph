import { AccountID, IAssetInput } from "../../model";
import { AssetFactory } from "../../model/factories";
import { PagingParams, parseCursorPagination, properlyOrdered } from "../../util/paging";
import { IHorizonTradeAggregationData, IHorizonTradeData } from "../types";
import { BaseHorizonDataSource } from "./base";

export class HorizonTradesDataSource extends BaseHorizonDataSource {
  public async all(
    pagingParams: PagingParams,
    baseAssetInput?: IAssetInput,
    counterAssetInput?: IAssetInput,
    offerID?: number
  ): Promise<IHorizonTradeData[]> {
    const params: any = {
      offer_id: offerID,
      ...parseCursorPagination(pagingParams),
      cacheTtl: 60 * 15
    };

    if (baseAssetInput) {
      const baseAsset = AssetFactory.fromInput(baseAssetInput);
      params.base_asset_type = baseAsset.getAssetType();
      params.base_asset_code = baseAsset.getCode();
      params.base_asset_issuer = baseAsset.getIssuer();
    }

    if (counterAssetInput) {
      const counterAsset = AssetFactory.fromInput(counterAssetInput);
      params.counter_asset_type = counterAsset.getAssetType();
      params.counter_asset_code = counterAsset.getCode();
      params.counter_asset_issuer = counterAsset.getIssuer();
    }

    return this.request("trades", params);
  }

  public async forAccount(accountID: AccountID, pagingParams: PagingParams): Promise<IHorizonTradeData[]> {
    return properlyOrdered(
      await this.request(`/accounts/${accountID}/trades`, {
        ...parseCursorPagination(pagingParams),
        cacheTtl: 60 * 15
      }),
      pagingParams
    );
  }

  public async forOffer(offerID: string, pagingParams: PagingParams): Promise<IHorizonTradeData[]> {
    return properlyOrdered(
      await this.request(`/offers/${offerID}/trades`, {
        ...parseCursorPagination(pagingParams),
        cacheTtl: 60 * 15
      }),
      pagingParams
    );
  }

  public async aggregations(
    baseAssetInput: IAssetInput,
    counterAssetInput: IAssetInput,
    startTime: number,
    endTime: number,
    resolution: number,
    pagingParams: PagingParams
  ): Promise<IHorizonTradeAggregationData[]> {
    const baseAsset = AssetFactory.fromInput(baseAssetInput);
    const counterAsset = AssetFactory.fromInput(counterAssetInput);

    return this.request("trade_aggregations", {
      base_asset_type: baseAsset.getAssetType(),
      base_asset_code: baseAsset.getCode(),
      base_asset_issuer: baseAsset.getIssuer(),
      counter_asset_type: counterAsset.getAssetType(),
      counter_asset_code: counterAsset.getCode(),
      counter_asset_issuer: counterAsset.getIssuer(),
      start_time: startTime,
      end_time: endTime,
      resolution,
      ...parseCursorPagination(pagingParams),
      cacheTtl: 60 * 5
    });
  }
}
