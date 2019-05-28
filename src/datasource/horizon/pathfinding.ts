import { AccountID, IAssetInput } from "../../model";
import { AssetFactory } from "../../model/factories";
import { IHorizonPaymentPathData } from "../types";
import { BaseHorizonDataSource } from "./base";

export class HorizonPathFindingDataSource extends BaseHorizonDataSource {
  public async findPaths(
    sourceAccountID: AccountID,
    destinationAccountID: AccountID,
    destinationAmount: string,
    destinationAssetInput: IAssetInput
  ): Promise<IHorizonPaymentPathData[]> {
    const destinationAsset = AssetFactory.fromInput(destinationAssetInput);

    return this.request("paths", {
      source_account: sourceAccountID,
      destination_account: destinationAccountID,
      destination_asset_type: destinationAsset.getAssetType(),
      destination_asset_code: destinationAsset.getCode(),
      destination_asset_issuer: destinationAsset.getIssuer(),
      destination_amount: destinationAmount,
      cacheTtl: 120
    });
  }
}
