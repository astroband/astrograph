import { IAssetInput } from "../../model";
import { PagingParams, parseCursorPagination, properlyOrdered } from "../../util/paging";
import { IHorizonAssetData } from "../types";
import { BaseHorizonDataSource } from "./base";

export class HorizonAssetsDataSource extends BaseHorizonDataSource {
  public async all(criteria: IAssetInput, pagingParams: PagingParams): Promise<IHorizonAssetData[]> {
    const records = await this.request("assets", {
      ...parseCursorPagination(pagingParams),
      asset_code: criteria.code,
      asset_issuer: criteria.issuer,
      cacheTtl: 600
    });

    return properlyOrdered(records, pagingParams);
  }
}
