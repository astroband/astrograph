import { IAssetInput } from "../../model";
import { IHorizonAssetData } from "../types";
import { BaseHorizonDataSource, PagingParams } from "./base";

export class HorizonAssetsDataSource extends BaseHorizonDataSource {
  public async all(criteria: IAssetInput, pagingParams: PagingParams): Promise<IHorizonAssetData[]> {
    const records = await this.request("assets", {
      ...this.parseCursorPagination(pagingParams),
      asset_code: criteria.code,
      asset_issuer: criteria.issuer,
      cacheTtl: 600
    });

    return this.properlyOrdered(records, pagingParams);
  }
}
