import { PagingParams } from "../datasource/horizon/base";
import { parseCursorPagination } from "../util/paging";
import { BaseStorage } from "./base";

export class OperationsStorage extends BaseStorage {
  public async all(pagingParams: PagingParams) {
    const { limit, order } = parseCursorPagination(pagingParams);

    return this.search({
      sort: [{ order }],
      size: limit
    });
  }

  public async byId(id: string) {
    return null;
  }

  protected get elasticIndexName() {
    return "op";
  }
}
