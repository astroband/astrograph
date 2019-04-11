import { IAssetInput } from "../../model";
import { AssetFactory } from "../../model/factories";
import { IHorizonOrderBookData } from "../types";
import { BaseHorizonDataSource } from "./base";

export class HorizonOrderBookDataSource extends BaseHorizonDataSource {
  public async row(
    sellingAssetInput: IAssetInput,
    buyingAssetInput: IAssetInput,
    limit?: number
  ): Promise<IHorizonOrderBookData> {
    const sellingAsset = AssetFactory.fromInput(sellingAssetInput);
    const buyingAsset = AssetFactory.fromInput(buyingAssetInput);

    return this.request("order_book", {
      selling_asset_type: sellingAsset.getAssetType(),
      selling_asset_code: sellingAsset.getCode(),
      selling_asset_issuer: sellingAsset.getIssuer(),
      buying_asset_type: buyingAsset.getAssetType(),
      buying_asset_code: buyingAsset.getCode(),
      buying_asset_issuer: buyingAsset.getIssuer(),
      limit,
      cacheTtl: 15
    });
  }
}
